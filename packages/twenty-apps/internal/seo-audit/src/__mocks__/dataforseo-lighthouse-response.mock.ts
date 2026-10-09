// Real DataForSEO Lighthouse response (mobile, homepage), reduced to the fields the app reads.
export const DATAFORSEO_LIGHTHOUSE_RESPONSE = {
 "version": "0.1.20260917",
 "status_code": 20000,
 "status_message": "Ok.",
 "cost": 0.005,
 "tasks_count": 1,
 "tasks_error": 0,
 "tasks": [
  {
   "id": "redacted",
   "status_code": 20000,
   "status_message": "Ok.",
   "cost": 0.005,
   "result_count": 1,
   "result": [
    {
     "lighthouseVersion": "13.4.0",
     "requestedUrl": "https://roaswell.com/",
     "finalUrl": "https://roaswell.com/",
     "fetchTime": "2026-10-08T20:58:44.689Z",
     "categories": {
      "performance": {
       "id": "performance",
       "title": "Performance",
       "score": 0.65
      }
     },
     "audits": {
      "largest-contentful-paint": {
       "id": "largest-contentful-paint",
       "title": "Largest Contentful Paint",
       "score": 0.05,
       "numericValue": 7137.517,
       "displayValue": "7.1 s"
      },
      "cumulative-layout-shift": {
       "id": "cumulative-layout-shift",
       "title": "Cumulative Layout Shift",
       "score": 1,
       "numericValue": 0.00046510503199123643,
       "displayValue": "0"
      },
      "total-blocking-time": {
       "id": "total-blocking-time",
       "title": "Total Blocking Time",
       "score": 0.91,
       "numericValue": 182,
       "displayValue": "180 ms"
      },
      "first-contentful-paint": {
       "id": "first-contentful-paint",
       "title": "First Contentful Paint",
       "score": 0.81,
       "numericValue": 2107.517,
       "displayValue": "2.1 s"
      },
      "speed-index": {
       "id": "speed-index",
       "title": "Speed Index",
       "score": 0.37,
       "numericValue": 6665.0086800116915,
       "displayValue": "6.7 s"
      }
     }
    }
   ]
  }
 ]
};
