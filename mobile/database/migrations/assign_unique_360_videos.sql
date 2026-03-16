-- Assign unique 360° test videos to each facility scene
-- Source: 360 VR Master Series free test videos (equirectangular)
-- Each facility's sub-scenes get different videos where possible

UPDATE public.facilities SET video_url = 'https://s3b-assets-bucket.s3.amazonaws.com/test-videos/360_VR+Master+Series+_+Free+Download+_+London+On+Tower+Bridge.mp4' WHERE id = 'cad-3d-printing';
UPDATE public.facilities SET video_url = 'https://s3b-assets-bucket.s3.amazonaws.com/test-videos/360_VR+Master+Series+_+Free+Download+_+London+Park+Ducks+Swans.mp4' WHERE id = 'laser-cutting';
UPDATE public.facilities SET video_url = 'https://s3b-assets-bucket.s3.amazonaws.com/test-videos/360_VR+Master+Series+_+Free+Download+_+View+On+Low+Waterfall+with+Nice+City.mp4' WHERE id = 'cnc-milling';
UPDATE public.facilities SET video_url = 'https://s3b-assets-bucket.s3.amazonaws.com/test-videos/Ayutthaya+-+Easy+Tripod+Paint+_+360_VR+Master+Series+_+Free+Download.mp4' WHERE id = 'auditorium';
UPDATE public.facilities SET video_url = 'https://s3b-assets-bucket.s3.amazonaws.com/test-videos/Ayutthaya+-+needs+stabilization+and+horizon+correction+_+360_VR+Master+Series+_+Free+Download.mp4' WHERE id = 'broadcasting';
UPDATE public.facilities SET video_url = 'https://s3b-assets-bucket.s3.amazonaws.com/test-videos/Doi+Suthep+-+Hard+Tripod+Paint+_+360_VR+Master+Series+_+Free+Download.mp4' WHERE id = 'digital-units';
UPDATE public.facilities SET video_url = 'https://s3b-assets-bucket.s3.amazonaws.com/test-videos/360_VR+Master+Series+_+Free+Download+_+London+On+Tower+Bridge.mp4' WHERE id = 'ancillary-services';
UPDATE public.facilities SET video_url = 'https://s3b-assets-bucket.s3.amazonaws.com/test-videos/Ayutthaya+-+needs+stabilization+and+horizon+correction+_+360_VR+Master+Series+_+Free+Download.mp4' WHERE id = 'main-lab';
UPDATE public.facilities SET video_url = 'https://s3b-assets-bucket.s3.amazonaws.com/test-videos/360_VR+Master+Series+_+Free+Download+_+London+Park+Ducks+Swans.mp4' WHERE id = 'innospace-main';
UPDATE public.facilities SET video_url = 'https://s3b-assets-bucket.s3.amazonaws.com/test-videos/Doi+Suthep+-+Hard+Tripod+Paint+_+360_VR+Master+Series+_+Free+Download.mp4' WHERE id = 'main-facility';
