-- 🐉 Dirgon Seed Reviews v2
-- הרץ את הקובץ הזה ב-Supabase SQL Editor
-- ביקורות לכל 12 הנכסים. משתמש ב-ON CONFLICT DO NOTHING כדי לדלג על ביקורות שכבר קיימות.
-- user_id = NULL מותר ומאפשר הכנסת ביקורות דמו.

-- דיזנגוף 100
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 4, 4, 5, 3,
  'גרתי בדירה שנתיים. בעל הדירה מאוד אדיב ומגיב מהר לכל פנייה. התחזוקה סבירה, היו כמה תקלות קטנות שטופלו תוך יומיים. המיקום מעולה – קרוב לכל דבר. המחיר קצת גבוה לגודל הדירה אבל זה דיזנגוף, אז זה צפוי.',
  '2023-01', '2024-12', 5200, '["deposit_returned", "contract_respected"]'::jsonb, 'approved', NOW() - INTERVAL '30 days'
FROM properties WHERE street = 'דיזנגוף' AND building_number = '100' LIMIT 1;

INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 4, 4, 4, 4,
  'דירה נחמדה במיקום מרכזי. הבניין ישן אבל מתוחזק. בעל הדירה היה בסדר, לא הכי זמין אבל כשהיה צריך הוא הגיע. הפיקדון הוחזר במלואו. הייתי ממליץ.',
  '2022-06', '2023-12', 4800, '["deposit_returned", "maintenance_timely"]'::jsonb, 'approved', NOW() - INTERVAL '45 days'
FROM properties WHERE street = 'דיזנגוף' AND building_number = '100' LIMIT 1;

-- רוטשילד 45
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 5, 5, 5, 4,
  'הדירה הכי טובה ששכרתי אי פעם. בעל הדירה מקצועי, תמיד זמין, תיקן הכל מיידית. הדירה משופצת ומודרנית. הפיקדון הוחזר ביום שעזבתי. שדרת רוטשילד זה חלום. המחיר גבוה אבל שווה כל שקל.',
  '2023-03', '2024-09', 7500, '["deposit_returned", "contract_respected", "maintenance_timely"]'::jsonb, 'approved', NOW() - INTERVAL '15 days'
FROM properties WHERE street = 'רוטשילד' AND building_number = '45' LIMIT 1;

INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 5, 4, 5, 4,
  'חוויה מעולה. הדירה מרווחת עם נוף לשדרה. בעל הדירה תמיד עונה לטלפון ומטפל בבעיות. היחיד חיסרון זה הרעש מהבארים בסוף שבוע, אבל אם זה לא מפריע לכם – מומלץ בחום.',
  '2022-01', '2023-06', 7000, '["deposit_returned", "contract_respected"]'::jsonb, 'approved', NOW() - INTERVAL '60 days'
FROM properties WHERE street = 'רוטשילד' AND building_number = '45' LIMIT 1;

-- בן יהודה 89
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 3, 3, 4, 3,
  'דירה בסדר, לא יותר מזה. המיקום טוב אבל הבניין ישן ומוזנח קצת. בעל הדירה נחמד ותקשורתי, אבל התחזוקה איטית – חיכיתי שבוע לתיקון של ברז. המחיר סביר לאזור.',
  '2023-05', '2024-05', 4200, '["contract_respected"]'::jsonb, 'approved', NOW() - INTERVAL '35 days'
FROM properties WHERE street = 'בן יהודה' AND building_number = '89' LIMIT 1;

-- אלנבי 52
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 4, 3, 4, 4,
  'אלנבי זה אזור עם הרבה חיים – בארים, מסעדות, קרוב לים. הדירה עצמה נקייה ומרווחת. בעל הדירה בסדר, לא הכי מהיר בתיקונים אבל בסוף הכל מסתדר. מומלץ למי שאוהב חיי לילה.',
  '2023-02', '2024-08', 4000, '["deposit_returned", "contract_respected"]'::jsonb, 'approved', NOW() - INTERVAL '22 days'
FROM properties WHERE street = 'אלנבי' AND building_number = '52' LIMIT 1;

-- פלורנטין 28
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 5, 4, 5, 4,
  'פלורנטין זה אזור מדהים לגור בו. הדירה קטנה אבל מעוצבת יפה. בעל הדירה סופר נחמד, אפילו הביא לי מתנה כשנכנסתי. תחזוקה טובה, הכל עובד. ממליץ לכל מי שמחפש אווירה צעירה.',
  '2023-06', '2025-01', 4500, '["deposit_returned", "maintenance_timely", "contract_respected"]'::jsonb, 'approved', NOW() - INTERVAL '10 days'
FROM properties WHERE street = 'פלורנטין' AND building_number = '28' LIMIT 1;

-- נחלת בנימין 67
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 4, 4, 4, 3,
  'נחלת בנימין זה אזור קסום, קרוב לשוק הפשפשים ולנווה צדק. הדירה ישנה אבל מקסימה עם תקרות גבוהות. בעל הדירה עמד בחוזה ותיקן בעיות שהיו. הפיקדון הוחזר. המחיר גבוה אבל זה המיקום.',
  '2023-08', '2024-10', 5500, '["deposit_returned", "contract_respected"]'::jsonb, 'approved', NOW() - INTERVAL '18 days'
FROM properties WHERE street = 'נחלת בנימין' AND building_number = '67' LIMIT 1;

-- ביאליק 15 (רמת גן)
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 4, 4, 5, 4,
  'דירה יפה ברמת גן. שקט, ירוק, ונוח. בעל הדירה ממש אכפתי – התקשר לבדוק אם הכל בסדר כשנכנסתי. תחזוקה מהירה, הפיקדון הוחזר במלואו. חניה קצת בעייתית באזור אבל זה נכון לכל רמת גן.',
  '2023-01', '2024-12', 4200, '["deposit_returned", "contract_respected", "maintenance_timely"]'::jsonb, 'approved', NOW() - INTERVAL '25 days'
FROM properties WHERE street = 'ביאליק' AND building_number = '15' LIMIT 1;

-- הרצל 33
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 3, 2, 3, 3,
  'הדירה עצמה בסדר אבל בעל הדירה לא הכי מגיב. היו כמה תקלות אינסטלציה שלקח שבועות לתקן. הפיקדון הוחזר רק חלקית בטענה של נזקים שלא היו קיימים. המחיר סביר לאזור אבל הציפיות שלי היו גבוהות יותר.',
  '2023-04', '2024-04', 3800, '[]'::jsonb, 'approved', NOW() - INTERVAL '20 days'
FROM properties WHERE street = 'הרצל' AND building_number = '33' LIMIT 1;

-- שינקין 22
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 5, 5, 5, 4,
  'שינקין 22 זו דירה ברמה גבוהה מאוד. הבניין שופץ לאחרונה, יש מעלית חדשה, והדירה עצמה מודרנית לגמרי. בעל הדירה מקצועי ועמד בכל סעיפי החוזה. הפיקדון הוחזר במלואו. המיקום מושלם – ליד שוק הכרמל.',
  '2023-09', '2025-02', 5800, '["deposit_returned", "contract_respected", "maintenance_timely"]'::jsonb, 'approved', NOW() - INTERVAL '5 days'
FROM properties WHERE street = 'שינקין' AND building_number = '22' LIMIT 1;

INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 4, 4, 4, 4,
  'דירה טובה מאוד. גרתי שנה ולא היו בעיות מיוחדות. בעל הדירה היה בסדר גמור, ענה לכל פנייה תוך יום. האזור קצת רועש בלילות סוף שבוע אבל זה צפוי בשינקין. באופן כללי הייתי שוכר שוב.',
  '2022-10', '2023-09', 5500, '["deposit_returned"]'::jsonb, 'approved', NOW() - INTERVAL '90 days'
FROM properties WHERE street = 'שינקין' AND building_number = '22' LIMIT 1;

-- גורדון 8
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 4, 4, 4, 4,
  'רחוב גורדון שקט ונעים, קרוב לים ולקניון דיזנגוף. הדירה מרוהטת יפה ומאובזרת. בעל הדירה מגיב בזמן סביר ותיקן כל מה שביקשתי. הפיקדון הוחזר. הייתי ממליץ לזוגות צעירים.',
  '2023-07', '2024-11', 6200, '["deposit_returned", "contract_respected", "maintenance_timely"]'::jsonb, 'approved', NOW() - INTERVAL '12 days'
FROM properties WHERE street = 'גורדון' AND building_number = '8' LIMIT 1;

-- אבן גבירול 120
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 4, 3, 4, 4,
  'אבן גבירול זה מיקום מצוין – קרוב לפארק הירקון ולמרכז העיר. הדירה גדולה ומרווחת עם מרפסת שמש. בעל הדירה נחמד, התחזוקה קצת איטית אבל בסוף הכל מסתדר. יחס מחיר–ערך טוב.',
  '2023-03', '2024-09', 5000, '["deposit_returned", "contract_respected"]'::jsonb, 'approved', NOW() - INTERVAL '28 days'
FROM properties WHERE street = 'אבן גבירול' AND building_number = '120' LIMIT 1;

-- ז׳בוטינסקי 55 (רמת גן)
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
SELECT id, 4, 4, 5, 4,
  'דירה מודרנית במגדל ברמת גן. הנוף מהקומה השמינית מדהים. בעל הדירה מקצועי מאוד – חוזה מסודר, תקשורת מעולה, תיקונים בזמן. חניה בבניין, קרוב לרכבת הקלה. ממליץ בחום למי שעובד בתל אביב וגר ברמת גן.',
  '2023-04', '2025-01', 5800, '["deposit_returned", "contract_respected", "maintenance_timely"]'::jsonb, 'approved', NOW() - INTERVAL '8 days'
FROM properties WHERE street = 'ז׳בוטינסקי' AND building_number = '55' LIMIT 1;
