# Compact summary of one Lighthouse result (LHR JSON) for the audit agent, see lighthouse-audit.yml.
# A finding is an audit that counts towards a category score (weight > 0) and scored below 0.9.
# Its `key` is stable between runs: the agent finds existing issues by it, so it must not change.
def clip($n): if type == "string" and length > $n then .[0:$n] + "…" else . end;

. as $lhr
| [$lhr.categories[] | .id as $cat | .auditRefs[] | select(.weight > 0) | {cat: $cat, id, weight}]
| group_by(.id)
| map({id: .[0].id, categories: map(.cat), weight: (map(.weight) | max)}) as $weighted
| {
    url: $lhr.finalDisplayedUrl,
    fetchTime: $lhr.fetchTime,
    lighthouseVersion: $lhr.lighthouseVersion,
    formFactor: $lhr.configSettings.formFactor,
    categories: ($lhr.categories | map_values(.score)),
    metrics: (
      ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time",
       "cumulative-layout-shift", "speed-index"]
      | map({key: ., value: $lhr.audits[.].displayValue}) | from_entries
    ),
    findings: (
      [$weighted[] | . as $w | $lhr.audits[$w.id] as $a
       | select($a.score != null and $a.score < 0.9)
       | {
           key: "lighthouse:\($w.id)",
           audit: $w.id,
           categories: $w.categories,
           weight: $w.weight,
           score: $a.score,
           title: $a.title,
           description: ($a.description | clip(400)),
           displayValue: $a.displayValue,
           items: [($a.details.items // [])[:5][]
                   | {selector: .node.selector?, snippet: (.node.snippet? | clip(200)),
                      explanation: (.node.explanation? | clip(300)), url: .url?}
                   | with_entries(select(.value != null))]
         }]
      | sort_by(-.weight, .audit)
    ),
    # Not findings: estimated savings without weight in the score, for context only.
    opportunities: [$lhr.audits[] | select(.details.type? == "opportunity" and (.score // 1) < 0.9)
                    | {audit: .id, score, title, displayValue}]
  }
