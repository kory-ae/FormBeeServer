SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.6
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: account_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."account_type" ("id", "name", "description", "created_at", "updated_at") VALUES
	(1, 'Paid', 'Able to create surveys, create edit, delete submissions', '2024-12-05 18:01:32.302048+00', '2024-12-05 18:01:32.302048+00'),
	(2, 'Free', 'Able to add submissions ', '2024-12-05 18:01:54.462271+00', '2024-12-05 18:01:54.462271+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "email", "fullname", "created_at", "updated_at") VALUES
	('4ecbb309-dc0c-43dd-8b83-3607c274a358', 'kory.karr@gmail.com', NULL, '2024-12-17 17:16:11.003128+00', '2024-12-17 17:16:11.182398+00'),
	('0876677c-df80-4ddb-96f6-570396d65daf', 'kory.activationenergy@gmail.com', NULL, '2025-01-03 18:20:33.019375+00', '2025-01-03 18:20:33.019375+00'),
	('a646e293-00f3-4613-a41e-a6ea83448a44', 'ron.brush@comcast.net', NULL, '2025-01-07 20:28:04.504248+00', '2025-01-07 20:28:04.504248+00'),
	('d1a52a77-e021-4b70-acbf-e853e42454ca', 'kory.karr+pd1@gmail.com', NULL, '2025-01-26 00:09:13.776358+00', '2025-01-26 00:09:13.776358+00'),
	('94929371-b495-428d-85fe-f72d3e840d93', 'kory.karr+free1@gmail.com', NULL, '2025-01-26 00:21:03.021697+00', '2025-01-26 00:21:03.021697+00'),
	('cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', 'ron.brush@lifeworksproject.org', NULL, '2025-01-26 03:46:59.496334+00', '2025-01-26 03:46:59.496334+00'),
	('5233fa12-3203-4a34-8145-2aba8da5e423', 'kory.karr+anon@gmail.com', NULL, '2025-01-31 19:14:14.820789+00', '2025-01-31 19:14:14.820789+00'),
	('86ef9a70-6cdf-4781-a638-09c0ac27da50', 'kory.activationenergy+anon@gmail.com', NULL, '2025-01-31 19:47:07.50965+00', '2025-01-31 19:47:07.50965+00'),
	('6a670da6-f6b7-4161-a683-0805d2211173', NULL, NULL, '2025-02-02 21:20:26.834456+00', '2025-02-02 21:20:26.834456+00'),
	('6caaab2d-99c0-4502-a53c-19bc4c0b314d', NULL, NULL, '2025-02-02 22:48:20.292202+00', '2025-02-02 22:48:20.292202+00'),
	('939407d2-efa7-4fd1-a83a-1f8266722e38', NULL, NULL, '2025-02-02 22:52:39.787217+00', '2025-02-02 22:52:39.787217+00'),
	('38fb0c2b-7674-419b-aec1-0bfae6e70b64', NULL, NULL, '2025-02-02 22:54:35.915456+00', '2025-02-02 22:54:35.915456+00'),
	('c0f229a9-df13-41b2-8f3b-c5bbbd45550f', NULL, NULL, '2025-02-02 22:59:49.088461+00', '2025-02-02 22:59:49.088461+00'),
	('ee03563f-bc30-48d6-853a-8783191a4755', NULL, NULL, '2025-02-02 23:00:41.527468+00', '2025-02-02 23:00:41.527468+00'),
	('df6961ee-3ca6-4b62-bfff-2b2ad0c43c02', NULL, NULL, '2025-02-02 23:02:41.296647+00', '2025-02-02 23:02:41.296647+00'),
	('0b65d045-1e18-457c-b5c6-135752cfaebd', NULL, NULL, '2025-02-02 23:09:37.233409+00', '2025-02-02 23:09:37.233409+00'),
	('28f1f53d-a830-4a53-91fd-702b94fe550d', NULL, NULL, '2025-02-02 23:43:15.443884+00', '2025-02-02 23:43:15.443884+00'),
	('81701f71-8834-40b8-8515-a4c714f42596', NULL, NULL, '2025-02-02 23:44:45.105288+00', '2025-02-02 23:44:45.105288+00'),
	('2bf44741-c478-4292-9d4c-57271a314760', NULL, NULL, '2025-02-03 16:51:38.385289+00', '2025-02-03 16:51:38.385289+00'),
	('05d88c9d-ddd0-43db-a605-cd9b448fbf76', NULL, NULL, '2025-02-03 19:07:48.453461+00', '2025-02-03 19:07:48.453461+00'),
	('95042428-9539-40aa-9a54-59abd6e295e7', NULL, NULL, '2025-02-03 19:10:58.835172+00', '2025-02-03 19:10:58.835172+00');


--
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."forms" ("id", "user_id", "title", "description", "survey_url", "sheet_url", "visible_fields", "created_at", "updated_at", "form_id", "form_group_id", "header_field", "order_id") VALUES
	('1de54336-d874-4257-a51e-06e9ac2d67ca', 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', 'ACA Annual Investment Survey - Shutdowns', 'Shutdowns', 'https://form.jotform.com/250230596676159', NULL, '{"Operating / Company Name","Company Name at time of Investment",Website,"State / Province",City,"Zip Code/ Canada Postal Code ",Country,"Industry Sector","FTE Employees at time of Exit","","What was the Total Amount Invested in the Company by Group Members?","Year of Original Investment","Date of Your Exit","Method of Shutdown","Were there any elements of fraud triggering the company''s demise?","What Security Was Used In The Original Investment?","Pre-Money Valuation (or Cap) at time of investment","Was Any Member of Your Group on the Company''s Board or an Observer at any time?",Gender,Race,"Any Previous Experience as a Startup CEO?",""}', '2025-01-26 04:25:08.532992+00', '2025-01-26 04:25:08.532992+00', 250230596676159, 56, 'Operating / Company Name', 3),
	('25933991-2b5d-4d3a-be28-3eb355700cdf', 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', 'Benevolence Intake Form', 'Intake Form', 'https://form.jotform.com/243296272323153', NULL, '{Name,Email,"Cell Phone Number","Date of Visit/Call","What specific kind of assistance are you requesting?",Address}', '2025-01-26 03:53:26.71305+00', '2025-01-26 03:53:26.71305+00', 243296272323153, 55, 'Name', 2),
	('826329fa-6ac3-471b-ab34-0b9aa2711eaa', 'd1a52a77-e021-4b70-acbf-e853e42454ca', 'Friend Form', 'friend intake survey', 'https://form.jotform.com/250245955609059', NULL, '{Name,"How likely are you to be my friend?","Tell us about yourself"}', '2025-01-26 00:12:26.944687+00', '2025-01-26 00:12:26.944687+00', 250245955609059, 53, 'Name', 1),
	('a4231dfa-50cf-4238-8ea4-7e3e7da58e4b', 'd1a52a77-e021-4b70-acbf-e853e42454ca', 'Dessert Survey', 'what sweets do you like?', 'https://form.jotform.com/243434927424055', NULL, '{Name,"Favorite Ice Cream","Favorite Cookie","Favorite Cake"}', '2025-01-26 00:12:54.842346+00', '2025-01-26 00:12:54.842346+00', 243434927424055, 53, '', 2),
	('db9faaed-d2bb-4e24-9ca0-df7546796dab', 'd1a52a77-e021-4b70-acbf-e853e42454ca', 'Vacation Spots', '', 'https://form.jotform.com/243537858035060', NULL, '{Location,"What type of vacation spot does this best fit","How likely will you travel here?","Tell us why you want to travel here"}', '2025-01-26 00:14:03.423709+00', '2025-01-26 00:14:03.423709+00', 243537858035060, 53, '', 4),
	('0deee9eb-5bd3-407e-90e7-6ef8d19ff807', 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', 'Recipient Action Form ', 'Action form.', 'https://form.jotform.com/243375864202154', NULL, '{"Recipient Name",Email,"Cell Phone Number","Date of assistance","Summary of Request"}', '2025-01-26 03:54:25.345247+00', '2025-01-26 03:54:25.345247+00', 243375864202154, 55, '', 1),
	('1999ba3b-d5ed-41d4-8e21-71ce0115eeb4', 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', 'ACA Annual Investment Survey - Investments', 'Investments', 'https://form.jotform.com/242848482243159', NULL, '{"Your Name","Your email","Your Angel Group or Fund Name","Other Angel Group Name","Operating / Company Name",Website,"State / Province",City,"Zip Code/ Canada Postal Code ",Country,"Industry Sector","Stage of Company at time of Investment","Tax Structure","Revenue at Investment","Number of Full Time Employees at Investment ","",Gender,Race,"Any Previous Experience as a Startup CEO?","Year of Investment","Quarter of Investment","Your Group''s Contribution to the Investment Round","Round Stage","Was This a New or Follow-on Investment?","Total Estimated Investment Amount in this Round by all Investors","What Security Was Used In The Investment?","Pre-Money Valuation","Cap on Note","Method by which Your Group Invested","Number of Your Group Members Who Invested Individually","Is Any Member of Your Group on the Company''s Board or an Observer?","","Are You Aware of Other Angel Groups Involved in This Round?","Are You Aware of Venture Capital Groups Involved in This Round?","Is This An Investment Outside Your Normal Geographic Footprint?","","Comments, Questions or Suggestions to ACA Data Analytics Team",""}', '2025-01-27 03:46:24.857021+00', '2025-01-27 03:46:24.857021+00', 242848482243159, 56, '', 1),
	('c949d079-073f-4297-88d0-84648334da6b', 'd1a52a77-e021-4b70-acbf-e853e42454ca', 'Film Survey', 'asdf', 'https://form.jotform.com/243454961084057', NULL, '{"Favorite Actor","Least Favorite Actor","Favorite Film","Least Favorite Film","Hidden Field"}', '2025-01-26 00:13:10.962378+00', '2025-01-26 00:13:10.962378+00', 243454961084057, 53, '', 3),
	('6d8bc99d-59f8-4617-993e-cefc4d5eb293', 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', 'ACA Annual Investment Survey - Exits', 'Exits', 'https://form.jotform.com/250229095506153', NULL, '{"Operating / Company Name",Website,"State / Province"}', '2025-01-26 04:23:37.630585+00', '2025-01-26 04:23:37.630585+00', 250229095506153, 56, '', 2),
	('4a5f21b9-48ac-4860-bc29-ba4b95534a59', 'd1a52a77-e021-4b70-acbf-e853e42454ca', 'House Hunt', 'asdf', 'https://form.jotform.com/250245278239056', NULL, '{"House Name",Address,"House rating"}', '2025-01-26 00:13:34.4919+00', '2025-01-26 00:13:34.4919+00', 250245278239056, 54, '', 1),
	('173b3323-356d-49ed-b7b9-45549701e1f7', '0876677c-df80-4ddb-96f6-570396d65daf', 'Pitch Evaluation', 'Basics of sales pitch', 'https://form.jotform.com/250095745483059', NULL, '{"Member Name","Pitch Date","Evaluation of Pitch"}', '2025-01-30 22:11:43.525155+00', '2025-01-30 22:11:43.525155+00', 250095745483059, 51, '', 64),
	('62d2d652-11c1-48ed-951a-b6f63a4ea1de', '0876677c-df80-4ddb-96f6-570396d65daf', 'Research', 'Info about company', 'https://form.jotform.com/250096482181053', NULL, '{"Research completed by...","Due diligence checklist","Supporting Documentation"}', '2025-01-25 22:16:05.945549+00', '2025-01-25 22:16:05.945549+00', 250096482181053, 52, '', 10.9765625),
	('065f3f02-8e22-4385-8a51-e00e494d0566', '0876677c-df80-4ddb-96f6-570396d65daf', 'Comp info', 'Company header info', 'https://form.jotform.com/250096361858060', NULL, '{"Company Name","Business Sector"}', '2025-01-25 22:15:37.451202+00', '2025-01-25 22:15:37.451202+00', 250096361858060, 51, 'Company Name', 1.3720703125),
	('47d64389-c538-4fc6-9007-8bcd3f9b3b11', '0876677c-df80-4ddb-96f6-570396d65daf', 'Investment', 'Ipsum at dolor eum ut takimata dolor. Blandit consequat eros stet vero eum eu commodo nonumy est sit et takimata justo diam tation. Sit sed nulla et tempor quis lorem sit nulla ipsum ut amet sit no nonummy dolor est. Nonumy diam labore eos ea et ut est et lorem rebum et et consectetuer dolore rebum labore. Minim sea ea amet dolore sanctus clita rebum vel invidunt feugiat augue labore et sit velit eirmod. Sed sed in consectetuer ut eleifend labore consetetur. Takimata rebum ea labore suscipit euismod amet sit. Et sed ut kasd kasd lorem. Duo doming stet possim elitr et erat duis dolore laoreet sanctus tincidunt voluptua justo vel gubergren dolores in. Lorem consequat dolor et nonumy. Est et lobortis kasd feugiat. Dolores dolor feugait illum sanctus et. Ipsum labore ex nam adipiscing et vel no.', 'https://form.jotform.com/250096004898058', NULL, '{"Commitment Date",Phone,"Investment Amount","Scope of work"}', '2025-01-25 22:16:30.528434+00', '2025-01-25 22:16:30.528434+00', 250096004898058, 51, '', 3.43017578125);


--
-- Data for Name: form_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."form_group" ("id", "code", "group_name", "user_id", "created_at", "updated_at", "parent_form_id", "parent_read_only") VALUES
	(53, 'MURRR', 'Friend Group', 'd1a52a77-e021-4b70-acbf-e853e42454ca', '2025-01-26 00:11:53.793969+00', '2025-01-09 21:04:09.628478+00', '826329fa-6ac3-471b-ab34-0b9aa2711eaa', NULL),
	(54, 'W7JTD', 'Personal forms', 'd1a52a77-e021-4b70-acbf-e853e42454ca', '2025-01-26 00:13:20.028181+00', '2025-01-09 21:04:09.628478+00', NULL, NULL),
	(56, 'F1PFD', 'Angel Capital Association', 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', '2025-01-26 04:10:39.865179+00', '2025-01-09 21:04:09.628478+00', NULL, NULL),
	(55, 'ZW0PK', 'Council Tree Church', 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', '2025-01-26 03:52:39.371591+00', '2025-01-09 21:04:09.628478+00', '25933991-2b5d-4d3a-be28-3eb355700cdf', NULL),
	(74, '9Y8R7', 'New Group', 'a646e293-00f3-4613-a41e-a6ea83448a44', '2025-02-01 22:53:35.054088+00', '2025-01-09 21:04:09.628478+00', NULL, NULL),
	(51, 'JYRNE', 'Company Info', '0876677c-df80-4ddb-96f6-570396d65daf', '2025-01-25 22:12:58.047122+00', '2025-01-09 21:04:09.628478+00', '065f3f02-8e22-4385-8a51-e00e494d0566', true),
	(52, 'HICQ2', 'Background info', '0876677c-df80-4ddb-96f6-570396d65daf', '2025-01-25 22:16:34.789448+00', '2025-01-09 21:04:09.628478+00', NULL, false);


--
-- Data for Name: submission; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."submission" ("id", "user_id", "created_at", "submission_id", "form_id", "parent_submission_id") VALUES
	(79, 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', '2025-01-26 03:55:03.70808+00', '6136729030145770941', 243296272323153, NULL),
	(80, 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', '2025-01-26 03:55:20.812633+00', '6136729200141085726', 243375864202154, NULL),
	(81, 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', '2025-01-28 01:00:05.883565+00', '6138352050148194347', 243296272323153, NULL),
	(93, 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', '2025-02-02 03:34:30.748072+00', '6142764700145455007', 243296272323153, NULL),
	(94, 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', '2025-02-02 03:35:56.962574+00', '6142765560142441939', 243296272323153, NULL),
	(95, 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', '2025-02-02 03:54:05.74055+00', '6142776450144493650', 243375864202154, '6142765560142441939'),
	(96, 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', '2025-02-03 04:09:06.75046+00', '6143649460147249998', 243375864202154, '6142765560142441939'),
	(97, 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', '2025-02-03 04:09:33.800701+00', '6143649730145582363', 243375864202154, '6142765560142441939'),
	(98, 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', '2025-02-03 04:09:57.321903+00', '6143649970141359249', 243375864202154, '6142765560142441939'),
	(99, 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', '2025-02-03 04:12:10.219784+00', '6143651290148824176', 243296272323153, NULL),
	(100, '05d88c9d-ddd0-43db-a605-cd9b448fbf76', '2025-02-03 19:09:21.80668+00', '6144189614329143989', 250096004898058, '6142476834324498134'),
	(101, '05d88c9d-ddd0-43db-a605-cd9b448fbf76', '2025-02-03 19:10:11.109405+00', '6144190104327902549', 250095745483059, '6142476834324498134');


--
-- Data for Name: user_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_config" ("id", "user_id", "account_type_id", "jotform_key", "created_at", "updated_at") VALUES
	(62, 'd1a52a77-e021-4b70-acbf-e853e42454ca', 1, '551e79ddb4528873871c64516e854ef6', '2025-01-26 00:11:19.919766+00', '2025-01-26 00:11:19.919766+00'),
	(63, '94929371-b495-428d-85fe-f72d3e840d93', 2, NULL, '2025-01-26 00:24:03.275849+00', '2025-01-26 00:24:03.275849+00'),
	(64, 'cc694b71-3ea6-4efd-8ce6-0ad113c0fc52', 1, 'b05df5b8faa3a9bd1d28bba58bba21da', '2025-01-26 03:51:46.396731+00', '2025-01-26 03:51:46.396731+00'),
	(1, '4ecbb309-dc0c-43dd-8b83-3607c274a358', 1, '551e79ddb4528873871c64516e854ef6', '2024-12-17 18:38:59.783729+00', '2024-12-17 18:38:59.783729+00'),
	(12, '0876677c-df80-4ddb-96f6-570396d65daf', 1, 'd85b62571aed833313a565730ba79aae', '2025-01-03 18:22:14.591244+00', '2025-01-03 18:22:14.591244+00'),
	(35, 'a646e293-00f3-4613-a41e-a6ea83448a44', 1, 'b05df5b8faa3a9bd1d28bba58bba21da', '2025-01-07 23:03:00.363594+00', '2025-01-07 23:03:00.363594+00');


--
-- Data for Name: user_form_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_form_group" ("id", "user_id", "created_at", "updated_at", "form_group_id") VALUES
	(45, '94929371-b495-428d-85fe-f72d3e840d93', '2025-01-26 00:24:51.568132+00', '2025-01-26 00:24:51.568132+00', 53),
	(46, '2bf44741-c478-4292-9d4c-57271a314760', '2025-02-03 16:53:17.176216+00', '2025-02-03 16:53:17.176216+00', 51),
	(47, '05d88c9d-ddd0-43db-a605-cd9b448fbf76', '2025-02-03 19:07:50.958371+00', '2025-02-03 19:07:50.958371+00', 51),
	(48, '95042428-9539-40aa-9a54-59abd6e295e7', '2025-02-03 19:11:11.172245+00', '2025-02-03 19:11:11.172245+00', 51);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 732, true);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- Name: accounttype_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."accounttype_id_seq"', 2, true);


--
-- Name: form_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."form_group_id_seq"', 74, true);


--
-- Name: submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."submission_id_seq"', 101, true);


--
-- Name: survey_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

--SELECT pg_catalog.setval('"public"."survey_user_id_seq"', 48, true);


--
-- Name: user_accounttype_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."user_accounttype_id_seq"', 71, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
