insert into public.days (date, sunset_at, weather_summary, note)
values
  ('2026-04-20', '2026-04-20 20:58:34+02', '{"summary":"Cielo despejado con luz dorada suave","source":"seed"}'::jsonb, 'La semana empieza con un cielo limpio.'),
  ('2026-04-21', '2026-04-21 20:59:36+02', '{"summary":"Nubes altas dispersas","source":"seed"}'::jsonb, 'Un atardecer ligero, casi transparente.'),
  ('2026-04-22', '2026-04-22 21:00:38+02', '{"summary":"Velo fino de nubes al oeste","source":"seed"}'::jsonb, 'La luz se quedo un poco mas.'),
  ('2026-04-23', '2026-04-23 21:01:40+02', '{"summary":"Tonos calidos despues de un dia claro","source":"seed"}'::jsonb, 'Hoy el cielo tuvo paciencia.'),
  ('2026-04-24', '2026-04-24 21:02:42+02', '{"summary":"Nubes medias con contraste suave","source":"seed"}'::jsonb, 'Un final de dia con textura.'),
  ('2026-04-25', '2026-04-25 21:03:44+02', '{"summary":"Horizonte limpio y colores intensos","source":"seed"}'::jsonb, 'El regalo llego en naranja.'),
  ('2026-04-26', '2026-04-26 21:04:46+02', '{"summary":"Cielo parcialmente cubierto","source":"seed"}'::jsonb, 'Una tarde tranquila para guardar.');

insert into public.photos (
  id,
  day_date,
  captured_at,
  storage_path,
  score,
  score_components,
  exif,
  width,
  height,
  is_best_of_day
)
values
  ('00000000-0000-4000-8000-000000000101', '2026-04-20', '2026-04-20 20:43:34+02', 'seed/2026-04-20/capture-01.jpg', 0.52, '{"saturation":0.48,"contrast":0.42,"warmth":0.58}'::jsonb, '{"iso":100,"exposure":"1/240"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000102', '2026-04-20', '2026-04-20 20:53:34+02', 'seed/2026-04-20/best.jpg', 0.86, '{"saturation":0.82,"contrast":0.74,"warmth":0.91}'::jsonb, '{"iso":100,"exposure":"1/180"}'::jsonb, 4056, 3040, true),
  ('00000000-0000-4000-8000-000000000103', '2026-04-20', '2026-04-20 21:03:34+02', 'seed/2026-04-20/capture-03.jpg', 0.63, '{"saturation":0.61,"contrast":0.55,"warmth":0.67}'::jsonb, '{"iso":125,"exposure":"1/160"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000104', '2026-04-20', '2026-04-20 21:13:34+02', 'seed/2026-04-20/capture-04.jpg', 0.49, '{"saturation":0.45,"contrast":0.39,"warmth":0.51}'::jsonb, '{"iso":160,"exposure":"1/120"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000201', '2026-04-21', '2026-04-21 20:44:36+02', 'seed/2026-04-21/capture-01.jpg', 0.57, '{"saturation":0.51,"contrast":0.47,"warmth":0.62}'::jsonb, '{"iso":100,"exposure":"1/220"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000202', '2026-04-21', '2026-04-21 20:54:36+02', 'seed/2026-04-21/best.jpg', 0.82, '{"saturation":0.77,"contrast":0.69,"warmth":0.88}'::jsonb, '{"iso":100,"exposure":"1/170"}'::jsonb, 4056, 3040, true),
  ('00000000-0000-4000-8000-000000000203', '2026-04-21', '2026-04-21 21:04:36+02', 'seed/2026-04-21/capture-03.jpg', 0.66, '{"saturation":0.63,"contrast":0.53,"warmth":0.71}'::jsonb, '{"iso":125,"exposure":"1/150"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000301', '2026-04-22', '2026-04-22 20:45:38+02', 'seed/2026-04-22/capture-01.jpg', 0.54, '{"saturation":0.49,"contrast":0.45,"warmth":0.59}'::jsonb, '{"iso":100,"exposure":"1/230"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000302', '2026-04-22', '2026-04-22 20:55:38+02', 'seed/2026-04-22/capture-02.jpg', 0.69, '{"saturation":0.66,"contrast":0.58,"warmth":0.73}'::jsonb, '{"iso":100,"exposure":"1/180"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000303', '2026-04-22', '2026-04-22 21:05:38+02', 'seed/2026-04-22/best.jpg', 0.88, '{"saturation":0.86,"contrast":0.76,"warmth":0.89}'::jsonb, '{"iso":125,"exposure":"1/150"}'::jsonb, 4056, 3040, true),
  ('00000000-0000-4000-8000-000000000304', '2026-04-22', '2026-04-22 21:15:38+02', 'seed/2026-04-22/capture-04.jpg', 0.58, '{"saturation":0.53,"contrast":0.49,"warmth":0.62}'::jsonb, '{"iso":160,"exposure":"1/110"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000401', '2026-04-23', '2026-04-23 20:46:40+02', 'seed/2026-04-23/capture-01.jpg', 0.59, '{"saturation":0.54,"contrast":0.52,"warmth":0.63}'::jsonb, '{"iso":100,"exposure":"1/210"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000402', '2026-04-23', '2026-04-23 20:56:40+02', 'seed/2026-04-23/best.jpg', 0.9, '{"saturation":0.88,"contrast":0.8,"warmth":0.93}'::jsonb, '{"iso":100,"exposure":"1/160"}'::jsonb, 4056, 3040, true),
  ('00000000-0000-4000-8000-000000000403', '2026-04-23', '2026-04-23 21:06:40+02', 'seed/2026-04-23/capture-03.jpg', 0.71, '{"saturation":0.7,"contrast":0.61,"warmth":0.74}'::jsonb, '{"iso":125,"exposure":"1/140"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000404', '2026-04-23', '2026-04-23 21:16:40+02', 'seed/2026-04-23/capture-04.jpg', 0.5, '{"saturation":0.47,"contrast":0.43,"warmth":0.54}'::jsonb, '{"iso":160,"exposure":"1/100"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000501', '2026-04-24', '2026-04-24 20:47:42+02', 'seed/2026-04-24/capture-01.jpg', 0.56, '{"saturation":0.52,"contrast":0.48,"warmth":0.61}'::jsonb, '{"iso":100,"exposure":"1/220"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000502', '2026-04-24', '2026-04-24 20:57:42+02', 'seed/2026-04-24/capture-02.jpg', 0.68, '{"saturation":0.64,"contrast":0.59,"warmth":0.69}'::jsonb, '{"iso":100,"exposure":"1/170"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000503', '2026-04-24', '2026-04-24 21:07:42+02', 'seed/2026-04-24/best.jpg', 0.84, '{"saturation":0.8,"contrast":0.73,"warmth":0.86}'::jsonb, '{"iso":125,"exposure":"1/130"}'::jsonb, 4056, 3040, true),
  ('00000000-0000-4000-8000-000000000601', '2026-04-25', '2026-04-25 20:48:44+02', 'seed/2026-04-25/capture-01.jpg', 0.61, '{"saturation":0.57,"contrast":0.53,"warmth":0.66}'::jsonb, '{"iso":100,"exposure":"1/210"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000602', '2026-04-25', '2026-04-25 20:58:44+02', 'seed/2026-04-25/best.jpg', 0.92, '{"saturation":0.91,"contrast":0.83,"warmth":0.94}'::jsonb, '{"iso":100,"exposure":"1/150"}'::jsonb, 4056, 3040, true),
  ('00000000-0000-4000-8000-000000000603', '2026-04-25', '2026-04-25 21:08:44+02', 'seed/2026-04-25/capture-03.jpg', 0.74, '{"saturation":0.72,"contrast":0.64,"warmth":0.76}'::jsonb, '{"iso":125,"exposure":"1/120"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000604', '2026-04-25', '2026-04-25 21:18:44+02', 'seed/2026-04-25/capture-04.jpg', 0.55, '{"saturation":0.5,"contrast":0.46,"warmth":0.58}'::jsonb, '{"iso":160,"exposure":"1/90"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000701', '2026-04-26', '2026-04-26 20:49:46+02', 'seed/2026-04-26/capture-01.jpg', 0.53, '{"saturation":0.49,"contrast":0.44,"warmth":0.57}'::jsonb, '{"iso":100,"exposure":"1/230"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000702', '2026-04-26', '2026-04-26 20:59:46+02', 'seed/2026-04-26/capture-02.jpg', 0.67, '{"saturation":0.62,"contrast":0.56,"warmth":0.7}'::jsonb, '{"iso":100,"exposure":"1/180"}'::jsonb, 4056, 3040, false),
  ('00000000-0000-4000-8000-000000000703', '2026-04-26', '2026-04-26 21:09:46+02', 'seed/2026-04-26/best.jpg', 0.81, '{"saturation":0.76,"contrast":0.7,"warmth":0.84}'::jsonb, '{"iso":125,"exposure":"1/140"}'::jsonb, 4056, 3040, true);

update public.days
set best_photo_id = best_photos.photo_id
from (
  values
    ('2026-04-20'::date, '00000000-0000-4000-8000-000000000102'::uuid),
    ('2026-04-21'::date, '00000000-0000-4000-8000-000000000202'::uuid),
    ('2026-04-22'::date, '00000000-0000-4000-8000-000000000303'::uuid),
    ('2026-04-23'::date, '00000000-0000-4000-8000-000000000402'::uuid),
    ('2026-04-24'::date, '00000000-0000-4000-8000-000000000503'::uuid),
    ('2026-04-25'::date, '00000000-0000-4000-8000-000000000602'::uuid),
    ('2026-04-26'::date, '00000000-0000-4000-8000-000000000703'::uuid)
) as best_photos(day_date, photo_id)
where days.date = best_photos.day_date;
