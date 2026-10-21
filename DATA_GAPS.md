# DATA_GAPS

Checked against the supplied `places.research.json`, `images.manifest.json`, and the linked source pages on 2026-10-21. “Reported” means a source mentions the place or activity; it does not mean the site, service, price, access point, or schedule has been verified for a visitor today.

## Place and experience gaps

| Place / activity | Source evidence | Still needed before map or route use |
| --- | --- | --- |
| Bến Wetro Line – Moon River | Vietnam Travel describes a ca-no trip from Tân Cảng to this pier; a later Xudua article describes a research trip and water/land connection proposal. | Current operator confirmation, visitor access, exact public entrance coordinates, service days, safety/access rules, duration and current price. A research trip is not a public timetable. |
| Vườn Ký Ức – Vườn trái cây Tư Huỳnh | Xudua research article uses both names for one garden and describes orchard and Thủy Đạo context. | Exact entrance/address and coordinates, current visitor access, fruit season by date, activities, hours, fees and direct contact. |
| Vườn Làng nghề sáng tạo Bình Mỹ | Name appears in the supplied research bundle. | Independent evidence for exact site identity, address, entrance, activities currently offered, hours and fees. The name alone does not establish an active workshop. |
| Làng gốm Hai Tú | Vietnam Travel describes pottery learning/activities at Hai Tú. | Current operator confirmation, visit/workshop schedule, exact entrance coordinates, duration, age suitability, price and booking contact. |
| Trang trại bò sữa Ba Thẳng | Vietnam Travel describes farm activities including animal care and agriculture. | Current visitor access, confirmed activities, animal-safety requirements, age suitability, exact entrance, duration, hours, fee and contact. |
| Đan lục bình tại Bình Mỹ | Vietnam Travel mentions the activity in the area, without naming a household. | A named household/operator and permission to publish contact/access details. It remains a sourced article note only: no pin, route stop or booking. |

For all five named places, the supplied dataset has no verified coordinates, current address, direct contact, opening hours, published price, visit duration or current operating confirmation. The routing matrix and GeoJSON are intentionally empty. As a result, the planner currently returns no route and displays the missing-data reasons instead of drawing straight lines or inventing ETAs.

## Images

All 9 image records supplied in `images.manifest.json` are marked `publishAllowed: false` and `permission_not_verified`. They are retained under `research-assets/unverified/` for reference and are not rendered on public pages. Credit and source metadata remain in `data/images.json`. Obtain written permission or replace them with self-owned/permitted images before adding a path under `public/images/places/`.

## Verification checklist for content updates

Before marking an identity, address, entrance, operation, hours, season, duration, child-suitability or price as verified, record a dated primary source or direct confirmation. Confirm that coordinates point to the visitor entrance, not an office or commune center. For river activities, record the actual boarding/alighting points, mode, operating calendar, duration and safety conditions separately from road travel. Add routing edges direction-by-direction with one consistent provider/profile and matching geometry, duration and distance. Keep unknown facts `null` and mark their status; do not use `0`, “free”, “open all day” or “available” as a substitute.

