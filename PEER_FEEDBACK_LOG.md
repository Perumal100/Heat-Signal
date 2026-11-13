# Heat Signal - Peer Feedback Log

**Student:** Perumal Marimuthu  
**Prototype:** NYC 311 Heat and Hot Water Requests, 2024  
**Session date:** November 12, 2026

**Feedback from Ashik John:** Ashik found that the full 264,750-record extract, four question-driven views, and cross-filtering were clear and easy to trust. He specifically noted that selecting Brooklyn updates the filter chip, KPI total, and monthly chart together. His main suggested improvement is the weekday-hour heatmap: its teal-to-yellow-to-orange ramp uses multiple hues for ordered report counts, which can make mid-range values harder to compare and less clear in greyscale or for colourblind viewers.

**Planned final change:** I will replace the heatmap with a single-hue light-to-dark sequential ramp (for example, D3 `interpolateOranges`) so darker always means more reports. I will also add labelled legend values, such as 0, 5,000, and 10,000 requests, and check the result in greyscale before the final submission.
