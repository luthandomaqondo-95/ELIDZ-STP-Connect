-- Seed news table with initial hardcoded data
-- This script migrates the hardcoded news data from the app to the database

-- Note: author_id is set to NULL since we don't have a specific "ELIDZ Communications" profile
-- You can update these later to reference actual profile IDs if needed

-- News Item 1: ELIDZ AGM Reflects on 2024/25 Performance
INSERT INTO public.news (id, title, content, author_id, image_url, published_at, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  'ELIDZ AGM Reflects on 2024/25 Performance and Reaffirms Commitment to Vision 2030',
  'Today, 13 November 2025, the East London Industrial Development Zone (ELIDZ) held its Annual General Meeting (AGM), it presented its 2024/25 financial year performance highlights and strategic developments driving industrial growth and investment in the Eastern Cape.

The AGM marked the conclusion of ELIDZ''s Vision 2025 strategy, a five-year programme that has strengthened the Zone''s role as a hub of industrial growth, innovation, and socio-economic development in the Eastern Cape.

Financial year 2024/25 demonstrated ELIDZ''s resilience and strategic maturity, achieving 78% of its annual performance targets, maintaining a BBBEE Level 3 rating, and securing its 10th consecutive clean audit. The Zone has attracted R4.6 billion in new private sector investments, significantly exceeding the annual target of R500 million. These investments include key sectors such as ICT, automotive, agro-processing, and renewable energy, creating over 5,000 operational jobs and contributing to an 11.7% growth in industrial turnover and export-oriented production, well above the target.

Through its Science and Technology Park (STP), ELIDZ developed four prototypes and commercialised two innovations, reinforcing technology transfer and integration of SMEs into regional value chains. The Zone maintained five active incubators, nurturing start-ups and small businesses to strengthen their industrial participation. Over 300 beneficiaries received skills training in emerging fields such as ICT, renewable energy, and advanced manufacturing, equipping local talent for future industrial demands.

In the 2024/25 financial year, ELIDZ strengthened its commitment to inclusive growth and socio-economic transformation through 20 Corporate Social Investment (CSI) initiatives. These projects directly supported education, youth empowerment, and the growth of local enterprises, ensuring that the benefits of industrial development reach the wider Eastern Cape community.

Through its SMME Development Programme, ELIDZ upgraded 11 emerging businesses by at least two CIDB levels, equipping them with the technical and operational capacity to participate in larger industrial projects. ELIDZ''s commitment to nurturing future talent is demonstrated through its internship and bursary programmes, which supported over 55 interns and 13 students from the Eastern Cape during the year.

As ELIDZ execute the Vision 2030 strategy, the Zone will deepen its commitment to environmental, social, and governance (ESG) excellence, embedding sustainability across all operations.',
  NULL,
  NULL,
  '2025-11-13 00:00:00+00',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
)
ON CONFLICT (id) DO NOTHING;

-- News Item 2: ELIDZ Marks 10 Years of Clean Audits
INSERT INTO public.news (id, title, content, author_id, image_url, published_at, created_at, updated_at)
VALUES (
  'b2c3d4e5-f6a7-4890-b123-456789012345',
  'ELIDZ Marks 10 Years of Clean Audits – A Decade of Excellence, Integrity, and Impact',
  'The East London Industrial Development Zone (ELIDZ) is proud to announce its 10th consecutive clean audit opinion from the Auditor General of South Africa for the 2024/25 financial year. This achievement reflects a decade of unwavering discipline to sound financial management, compliance with legislation, governance and operational transparency, and a deep commitment to public accountability.

This means ELIDZ received a financially unqualified audit with no material findings, as confirmed by the Auditor-General.

Clean audits are a powerful indicator of institutional integrity and compliance with public sector financial regulations. Achieving this level of consistency over ten years is a rare accomplishment and positions ELIDZ as a national benchmark for good governance in the economic development space.

"This milestone is not just a reflection of our financial discipline," said Tembela Zweni, Chief Executive Officer of ELIDZ. "It speaks to the culture of accountability and professionalism that underpins everything we do, from strategic planning to implementation. It also affirms our readiness to support high-impact investment with credibility and confidence."

Echoing this sentiment, ELIDZ Chief Financial Officer Gift Matengambiri added, "Ten clean audits in a row is no small accomplishment. It is the result of robust internal controls, a committed finance team and a shared organisational culture of doing things right. This achievement reinforces our reputation as a reliable and transparent institution."

As a catalyst for industrial development and investment attraction in the Eastern Cape, ELIDZ continues to deliver on its mandate with credibility and impact. The organisation''s ability to maintain clean audits year after year strengthens investor confidence and affirms its role in driving economic transformation.

This milestone comes as ELIDZ expands its strategic focus across targeted high growth areas: Automotive, Agri-Industry, Digital Economy, Sustainable Energy, Advanced Manufacturing, Logistics, and Aquaculture. It also aligns with the organisation''s Vision 2030, which aims to drive inclusive growth, sustainability and innovation across the region.',
  NULL,
  NULL,
  '2025-08-15 00:00:00+00',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
)
ON CONFLICT (id) DO NOTHING;

-- News Item 3: ELIDZ-STP Hosts Training Workshop on Electric Vehicle Fundamentals
INSERT INTO public.news (id, title, content, author_id, image_url, published_at, created_at, updated_at)
VALUES (
  'c3d4e5f6-a7b8-4901-c234-567890123456',
  'ELIDZ-STP Hosts an Innovative Training Workshop on Electric Vehicle Fundamentals',
  'The East London Industrial Development Zone, Science and Technology Park (ELIDZ-STP) recently hosted a five-day Professional Certificate of Competency in Fundamentals of Electric Vehicles (EV) training workshop. The programme is designed to upskill professionals, entrepreneurs, and the unemployed in the automotive sector by providing in-depth knowledge and practical experience in EV technology.

The workshop took place from 10 – 14 March 2025 at the ELIDZ-STP, drawing significant interest from across the Eastern Cape. Out of over 800 applications, 30 carefully selected participants were chosen to attend, ensuring a focused and impactful training experience.

These participants included engineers, mechanics, auto-electricians, and other professionals and entrepreneurs already working in or looking to transition into the EV sector. Their enthusiasm reflected a growing interest in electric mobility and the need for specialised skills in this rapidly evolving industry.

The workshop ensured that participants gain a well-rounded understanding of electric vehicles. Training was conducted by an industry expert from the Engineering Institute of Technology (EIT), an Australian-based organisation recognised by the South African Qualifications Authority (SAQA).

The training covered a broad spectrum of EV technology fundamentals, including:
• Introduction to EVs: Understanding electric, hybrid, and fuel cell vehicles
• Vehicle Components: EV layouts, power electronics, batteries, and charging infrastructure
• Electric Propulsion Systems: Motors, energy consumption, and performance
• Hybrid Drive Trains: Electrical coupling, control strategies, and design principles
• Safety & Hazard Management: High-voltage precautions, safe work procedures, and hazard mitigation

Participants engaged in interactive learning exercises, applying their newly acquired knowledge to real-world scenarios. Participants in due course will be issued with industry-recognised professional certificates. This certification is a critical step in preparing South Africa''s workforce to meet the increasing demand for electric vehicles and the infrastructure needed to support them.

The initiative aligns with the South African Automotive Masterplan (SAAM) 2035, which highlights skills development as a key strategic pillar in achieving the country''s long-term objectives for the automotive industry. Developing expertise in EV technology is essential as South Africa moves toward a sustainable, low-carbon economy.

With more than 120 automotive manufacturers operating in the Eastern Cape, the sector plays a pivotal role in the region''s economy. The province is home to four major automotive manufacturers, with three based in Nelson Mandela Metropolitan Municipality and one in Buffalo City Metropolitan Municipality. As the industry shifts toward electric mobility, the ELIDZ-STP aims to ensure that local professionals and entrepreneurs remain competitive and well-equipped for emerging opportunities.',
  NULL,
  NULL,
  '2025-03-27 00:00:00+00',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
)
ON CONFLICT (id) DO NOTHING;

-- News Item 4: ELIDZ Science and Technology Park Head Elected as IASP Africa Division President
INSERT INTO public.news (id, title, content, author_id, image_url, published_at, created_at, updated_at)
VALUES (
  'd4e5f6a7-b8c9-4012-d345-678901234567',
  'THE ELIDZ Science and Technology Park Head Elected as IASP Africa Division President',
  'Ludwe Macingwane, the Head of the East London Industrial Development Zone (ELIDZ) Science and Technology Park has been elected as the new Africa Division President of the International Association of Science Parks (IASP).

Macingwane is the second South African to be elected and the first black woman in the country to occupy this important office. She will officially assume her role on the 11 December 2024, taking over from the outgoing President, Eng. John Tanui from Kenya. Over the next two years, Macingwane will represent the African region on the IASP International Board of Directors on the various platforms of the IASP.

This achievement highlights the growing recognition of Africa''s role in global innovation, a cause championed by IASP since its establishment in 1984. Today, IASP connects 350 members across 77 countries, representing over 115,000 companies. The organisation has hosted 42 world conferences and 186 regional events, maintaining a strong presence through its six regional divisions: African, Asia Pacific, European, Latin American, North American, and West Asia North Africa (WANA). With offices in Málaga, Spain, and Beijing, China, IASP continues to serve as a hub for global innovation leadership.

Macingwane is the ideal candidate to lead the Africa Division of the IASP as she has been instrumental in propelling the ELIDZ Science and Technology Park to greater heights. For instance, under her leadership, the ELIDZ Science and Technology Park has achieved international recognition, notably as South Africa''s sole finalist in the 2024 Inspiring Solutions Awards held during the IASP World Conference in Nairobi, Kenya. This recognition underscores the ELIDZ Science and Technology Park''s commitment to innovation, collaboration, and global benchmarking.

"I am truly honoured to be elected. The election demonstrates my colleagues'' confidence in my ability to lead a diverse group of passionate professionals. I am truly humbled by the honour and promise to do my very best to achieve the goals of the African division as they relate to innovation," Macingwane said.

Join us in congratulating Macingwane on this remarkable achievement. Her appointment reflects her visionary leadership, dedication, and pivotal role in advancing innovation across Africa and beyond.',
  NULL,
  NULL,
  '2024-12-03 00:00:00+00',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
)
ON CONFLICT (id) DO NOTHING;

-- News Item 5: MEC FOR DEDEAT UNVEILS NEW 4IR COMPUTER LABORATORY AT UMTIZA HIGH SCHOOL
INSERT INTO public.news (id, title, content, author_id, image_url, published_at, created_at, updated_at)
VALUES (
  'e5f6a7b8-c9d0-4123-e456-789012345678',
  'MEC FOR DEDEAT UNVEILS NEW 4IR COMPUTER LABORATORY AT UMTIZA HIGH SCHOOL',
  'Today marked a significant milestone as the MEC for the Department of Economic Development, Environmental Affairs, and Tourism (DEDEAT), Ms Nonkqubela Ntomboxolo Pieters, joined key stakeholders, educators, and learners at Umtiza High School in Santa Settlement, East London, to unveil a state-of-the-art Community-Based Digital (4IR) Computer Laboratory. This pioneering initiative, facilitated through the office of the Eastern Cape Premier Lubabalo Oscar Mabuyane and led by the East London Industrial Development Zone (ELIDZ) in partnership with Microsoft South Africa and Deviare, an ICT small business, aims to boost digital literacy, bridge the digital divide, and empower youth in the Eastern Cape.

This project represents the first phase of a five-year Corporate Social Investment (CSI) initiative, with a total investment of R550,000, aimed at supporting five selected schools in the region. The ELIDZ contributed R200,000 to the project, with Microsoft South Africa covering the remaining R350,000. Housed in a repurposed shipping container, this innovative digital lab is fully equipped with 30 laptops, internet connectivity, and backup power, creating a hub of technological advancement and educational opportunity for Umtiza High School and the surrounding community.

"The ELIDZ is proud to partner with Umtiza High School as we work towards equipping young people with the skills to actively participate in technology-driven industries," stated Professor Mlungisi Makhalima, Chairperson of the ELIDZ Board of Directors. He emphasised that this initiative would help reduce the digital skills gap in the Eastern Cape, aligning with ELIDZ''s industrial development focus and growing investment in the automotive sector.

Speaking on behalf of Microsoft South Africa, Mr Asif Valley, a key donor and partner, expressed Microsoft''s commitment to driving digital inclusion in underserved communities. "This partnership represents a step forward in empowering youth with digital skills that are critical for todays and tomorrow''s workforce. By investing in digital education, Microsoft South Africa is helping to lay the foundation for a technology-savvy generation that will drive the South African economy forward."

During her keynote address, the MEC for DEDEAT, Ms Pieters, emphasised the importance of safeguarding this new resource, stating, "I urge the community members to safeguard this state-of-the-art facility." She highlighted that, "this significant project is part of implementing the pillars of the Eastern Cape economy".

The programme will provide digital literacy training to 90 Grade 11 students in three cohorts, each session spanning three months. Upon successful completion, each student will receive a digital literacy certificate, fostering their career readiness and strengthening the local talent pipeline for technology-driven industries, including the automotive sector.

This project also supports long-term community development goals. A Memorandum of Understanding (MOU) signed by all parties ensures sustainability and operational continuity, marking a milestone in the Eastern Cape''s socio-economic growth strategy. In addition to empowering learners, the project includes accredited training opportunities for Umtiza High School''s educators to improve teaching quality through technology integration.',
  NULL,
  NULL,
  '2024-10-31 00:00:00+00',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
)
ON CONFLICT (id) DO NOTHING;

-- News Item 6: East London IDZ STP in partnership with UNISA launches Eastern Cape Innovation Challenge 2025
INSERT INTO public.news (id, title, content, author_id, image_url, published_at, created_at, updated_at)
VALUES (
  'f6a7b8c9-d0e1-4234-f567-890123456789',
  'East London IDZ STP in partnership with UNISA launches Eastern Cape Innovation Challenge 2025',
  'The East London Industrial Development Zone (ELIDZ) in partnership with UNISA is proud to announce the official launch of the Eastern Cape Innovation Challenge 2025, a province-wide initiative led through the ELIDZ Science and Technology Park (STP) to drive socio-economic innovation.

This initiative aims to identify, support, and scale innovative solutions that address key challenges facing the Eastern Cape province. The challenge is open to innovators, entrepreneurs, researchers, and students across the region who are developing solutions in areas such as advanced manufacturing, ICT, renewable energy, Agri-tech, digital services, and research commercialisation.

The Eastern Cape Innovation Challenge 2025 represents a significant investment in the province''s innovation ecosystem, providing participants with access to incubation support, prototype development assistance, technical mentorship, business development services, and market access facilitation.

Through this partnership with UNISA, the ELIDZ-STP is leveraging academic expertise and research capabilities to support the translation of innovative ideas into commercial solutions that can drive economic growth and social development in the Eastern Cape.

The challenge aligns with the ELIDZ-STP''s broader mission to position the Eastern Cape as a hub for high-impact innovation, research translation, and enterprise development. By supporting innovators at various stages of development, from concept to commercialisation, the initiative aims to create a pipeline of investable technologies and scalable businesses that can contribute to the province''s economic transformation.

Participants in the Eastern Cape Innovation Challenge 2025 will have the opportunity to showcase their innovations during the Eastern Cape Innovation & Entrepreneurship Week (IEW) 2025, where winners will be announced and provided with comprehensive support packages to accelerate their growth.',
  NULL,
  NULL,
  '2025-01-15 00:00:00+00',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
)
ON CONFLICT (id) DO NOTHING;

