-- 🐉 Dirgon Seed Reviews
-- הרץ את הקובץ הזה ב-Supabase SQL Editor אחרי seed_data.sql
-- ביקורות לדוגמה כדי שדפי הנכסים ייראו "חיים"

-- ביקורות לדיזנגוף 100
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
VALUES
  (
    (SELECT id FROM properties WHERE street = 'דיזנגוף' AND building_number = '100' LIMIT 1),
    4, 4, 5, 3,
    'גרתי בדירה שנתיים. בעל הדירה מאוד אדיב ומגיב מהר לכל פנייה. התחזוקה סבירה, היו כמה תקלות קטנות שטופלו תוך יומיים. המיקום מעולה – קרוב לכל דבר. המחיר קצת גבוה לגודל הדירה אבל זה דיזנגוף, אז זה צפוי.',
    '2023-01', '2024-12', 5200,
    '["deposit_returned", "contract_respected"]',
    'approved',
    NOW() - INTERVAL '30 days'
  ),
  (
    (SELECT id FROM properties WHERE street = 'דיזנגוף' AND building_number = '100' LIMIT 1),
    4, 4, 4, 4,
    'דירה נחמדה במיקום מרכזי. הבניין ישן אבל מתוחזק. בעל הדירה היה בסדר, לא הכי זמין אבל כשהיה צריך הוא הגיע. הפיקדון הוחזר במלואו. הייתי ממליץ.',
    '2022-06', '2023-12', 4800,
    '["deposit_returned", "maintenance_timely"]',
    'approved',
    NOW() - INTERVAL '45 days'
  );

-- ביקורות לרוטשילד 45
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
VALUES
  (
    (SELECT id FROM properties WHERE street = 'רוטשילד' AND building_number = '45' LIMIT 1),
    5, 5, 5, 4,
    'הדירה הכי טובה ששכרתי אי פעם. בעל הדירה מקצועי, תמיד זמין, תיקן הכל מיידית. הדירה משופצת ומודרנית. הפיקדון הוחזר ביום שעזבתי. שדרת רוטשילד זה חלום. המחיר גבוה אבל שווה כל שקל.',
    '2023-03', '2024-09', 7500,
    '["deposit_returned", "contract_respected", "maintenance_timely"]',
    'approved',
    NOW() - INTERVAL '15 days'
  ),
  (
    (SELECT id FROM properties WHERE street = 'רוטשילד' AND building_number = '45' LIMIT 1),
    5, 4, 5, 4,
    'חוויה מעולה. הדירה מרווחת עם נוף לשדרה. בעל הדירה תמיד עונה לטלפון ומטפל בבעיות. היחיד חיסרון זה הרעש מהבארים בסוף שבוע, אבל אם זה לא מפריע לכם – מומלץ בחום.',
    '2022-01', '2023-06', 7000,
    '["deposit_returned", "contract_respected"]',
    'approved',
    NOW() - INTERVAL '60 days'
  );

-- ביקורת לפלורנטין 28
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
VALUES
  (
    (SELECT id FROM properties WHERE street = 'פלורנטין' AND building_number = '28' LIMIT 1),
    5, 4, 5, 4,
    'פלורנטין זה אזור מדהים לגור בו. הדירה קטנה אבל מעוצבת יפה. בעל הדירה סופר נחמד, אפילו הביא לי מתנה כשנכנסתי. תחזוקה טובה, הכל עובד. ממליץ לכל מי שמחפש אווירה צעירה.',
    '2023-06', '2025-01', 4500,
    '["deposit_returned", "maintenance_timely", "contract_respected"]',
    'approved',
    NOW() - INTERVAL '10 days'
  );

-- ביקורת לשינקין 22
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
VALUES
  (
    (SELECT id FROM properties WHERE street = 'שינקין' AND building_number = '22' LIMIT 1),
    5, 5, 5, 4,
    'שינקין 22 זו דירה ברמה גבוהה מאוד. הבניין שופץ לאחרונה, יש מעלית חדשה, והדירה עצמה מודרנית לגמרי. בעל הדירה מקצועי ועמד בכל סעיפי החוזה. הפיקדון הוחזר במלואו. המיקום מושלם – ליד שוק הכרמל ותחנות אוטובוס.',
    '2023-09', '2025-02', 5800,
    '["deposit_returned", "contract_respected", "maintenance_timely"]',
    'approved',
    NOW() - INTERVAL '5 days'
  ),
  (
    (SELECT id FROM properties WHERE street = 'שינקין' AND building_number = '22' LIMIT 1),
    4, 4, 4, 4,
    'דירה טובה מאוד. גרתי שנה ולא היו בעיות מיוחדות. בעל הדירה היה בסדר גמור, ענה לכל פנייה תוך יום. האזור קצת רועש בלילות סוף שבוע אבל זה צפוי בשינקין. באופן כללי הייתי שוכר שוב.',
    '2022-10', '2023-09', 5500,
    '["deposit_returned"]',
    'approved',
    NOW() - INTERVAL '90 days'
  );

-- ביקורת להרצל 33 (דירוג נמוך יותר)
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
VALUES
  (
    (SELECT id FROM properties WHERE street = 'הרצל' AND building_number = '33' LIMIT 1),
    3, 2, 3, 3,
    'הדירה עצמה בסדר אבל בעל הדירה לא הכי מגיב. היו כמה תקלות אינסטלציה שלקח שבועות לתקן. הפיקדון הוחזר רק חלקית בטענה של "נזקים" שלא היו קיימים. המחיר סביר לאזור אבל הציפיות שלי היו גבוהות יותר.',
    '2023-04', '2024-04', 3800,
    '[]',
    'approved',
    NOW() - INTERVAL '20 days'
  );

-- ביקורת לביאליק 15, רמת גן
INSERT INTO reviews (property_id, overall_rating, maintenance_rating, communication_rating, value_rating, review_text, rental_start, rental_end, monthly_rent, tags, status, created_at)
VALUES
  (
    (SELECT id FROM properties WHERE street = 'ביאליק' AND building_number = '15' LIMIT 1),
    4, 4, 5, 4,
    'דירה יפה ברמת גן. שקט, ירוק, ונוח. בעל הדירה ממש אכפתי – התקשר לבדוק אם הכל בסדר כשנכנסתי. תחזוקה מהירה, הפיקדון הוחזר במלואו. חניה קצת בעייתית באזור אבל זה נכון לכל רמת גן.',
    '2023-01', '2024-12', 4200,
    '["deposit_returned", "contract_respected", "maintenance_timely"]',
    'approved',
    NOW() - INTERVAL '25 days'
  );
