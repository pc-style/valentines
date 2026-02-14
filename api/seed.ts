import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./_db.js";

const seedPhotos = [
  { src: "/photos/0803FEEC-3561-448D-940E-9F43F4CD8D8F_1_105_c.jpeg", date: "25 sierpnia 2023", message: "Tu wszystko się zaczęło...", section: "polaroid" },
  { src: "/photos/4EDDEE89-DE9F-46CF-BBC2-4F35D79F56B7_1_105_c.jpeg", date: "27 sierpnia 2023", message: "Wpisz swoją wiadomość...", section: "polaroid" },
  { src: "/photos/418FCFE9-A6D1-4D68-A4D5-C48A16BA43D7_1_105_c.jpeg", date: "31 sierpnia 2023", message: "Co czułeś/aś w tym dniu?", section: "polaroid" },
  { src: "/photos/AD657948-4AAF-49E4-B289-059DFC99A658_1_105_c.jpeg", date: "2 września 2023", message: "Tu opisz ten moment...", section: "polaroid" },
  { src: "/photos/20283B88-A03F-4B40-9722-29BA8595C9DE_1_105_c.jpeg", date: "28 października 2023", message: "Jakie emocje wywołuje to zdjęcie?", section: "polaroid" },
  { src: "/photos/E56CC761-CF27-4243-8ADA-489D27A05EFC_1_105_c.jpeg", date: "3 listopada 2023", message: "Twoje wspomnienie z tego dnia...", section: "polaroid" },
  { src: "/photos/05239797-428E-4120-BD25-5FB1C2F53E74_1_105_c.jpeg", date: "31 grudnia 2023", message: "Napisz coś wyjątkowego...", section: "polaroid" },
  { src: "/photos/28E0A787-B25C-4F9D-A8C3-0F804B4DF39A_1_105_c.jpeg", date: "5 maja 2024", message: "Opisz to zdjęcie własnymi słowami...", section: "polaroid" },
  { src: "/photos/3F787146-BB62-401B-A54E-014E08555613_1_105_c.jpeg", date: "9 maja 2024", message: "Dodaj swoją osobistą notatkę...", section: "polaroid" },
  { src: "/photos/1DD5929E-5A0D-46FA-A09A-3604AF7B1B73_1_102_o.jpeg", date: "25 lipca 2024", message: "Co sprawiło, że ten dzień był wyjątkowy?", section: "polaroid" },
  { src: "/photos/A5C6C4A8-003D-4E09-8FCE-7121A367E6CF_1_105_c.jpeg", date: "27 lipca 2024", message: "Twoje słowa do tego wspomnienia...", section: "polaroid" },
  { src: "/photos/37F956A4-9A09-43F7-A047-B72E9F284FAB_1_102_o.jpeg", date: "27 lipca 2024", message: "Opowiedz historię tego zdjęcia...", section: "polaroid" },
  { src: "/photos/F6A2C96D-E65A-4414-BAA3-CEFBB4BA0B51_1_102_o.jpeg", date: "3 grudnia 2024", message: "Wpisz tutaj swoje przemyślenia...", section: "polaroid" },
  { src: "/photos/532EDDDC-FA46-4300-8BD4-34DFAF6E69D3_1_105_c.jpeg", date: "3 grudnia 2024", message: "Podziel się tym, co pamiętasz...", section: "polaroid" },
  { src: "/photos/6AAC7045-48D7-472D-B0FE-124EF6480C4F_1_105_c.jpeg", date: "12 stycznia 2025", message: "Twoja wiadomość do tego kadru...", section: "polaroid" },
  { src: "/photos/E739357D-836B-4F23-B818-DC969D19FCEC_1_105_c.jpeg", date: "23 lutego 2025", message: "Opisz atmosferę tego dnia...", section: "polaroid" },
  { src: "/photos/49746577-E201-4373-8D9F-327C2A39C067_4_5005_c.jpeg", date: "28 kwietnia 2025", message: "Co chciałbyś/abyś zapamiętać?", section: "polaroid" },
  { src: "/photos/AF7782DA-2C89-4244-A59B-B0B51D2EDCF2_4_5005_c.jpeg", date: "28 kwietnia 2025", message: "Wpisz swoje wspomnienie...", section: "film" },
  { src: "/photos/BCAEB873-AC65-4848-AE5F-3F8B652B8521_4_5005_c.jpeg", date: "28 kwietnia 2025", message: "Jaki był ten dzień dla Ciebie?", section: "film" },
  { src: "/photos/AA476FFF-DA38-4A93-A152-03C174DBE988_4_5005_c.jpeg", date: "28 kwietnia 2025", message: "Tu wpisz swoją wiadomość...", section: "film" },
  { src: "/photos/B4F54CBF-BC03-4644-AF26-DA9A677FED04_1_105_c.jpeg", date: "30 kwietnia 2025", message: "Napisz, co wtedy czułeś/aś...", section: "film" },
  { src: "/photos/AB23AA68-98F4-4186-AD71-0E9738C1F00D_1_105_c.jpeg", date: "30 kwietnia 2025", message: "Opisz ten szczególny moment...", section: "film" },
  { src: "/photos/45ACC1F6-C253-4A9F-8BE7-06BE87E17C2B_1_105_c.jpeg", date: "1 lipca 2025", message: "Twoje wyznanie do tego zdjęcia...", section: "film" },
  { src: "/photos/1CA498DE-9972-44FF-B1EB-66B9E6C7BEE3_1_105_c.jpeg", date: "3 lipca 2025", message: "Co oznacza dla Ciebie ta chwila?", section: "film" },
  { src: "/photos/F76A59E1-4520-4531-A3E9-C00F65C670A0_1_102_o.jpeg", date: "3 lipca 2025", message: "Dodaj kilka słów o tym dniu...", section: "film" },
  { src: "/photos/3CB3CAB5-9E2F-4B3C-8204-4FB608225A2E_1_105_c.jpeg", date: "10 lipca 2025", message: "Jakie uczucia budzi to wspomnienie?", section: "film" },
  { src: "/photos/5477DDCC-1BCF-4AF5-BEBB-8246F83F7955_1_105_c.jpeg", date: "10 lipca 2025", message: "Opisz to zdjęcie jednym zdaniem...", section: "film" },
  { src: "/photos/AFAC095F-7ED5-44F0-BCE5-85694786745E_1_105_c.jpeg", date: "28 lipca 2025", message: "Napisz, dlaczego to zdjęcie jest ważne...", section: "film" },
  { src: "/photos/6A31FAB6-66E7-441B-8A27-76BEF9E0FA40_1_105_c.jpeg", date: "30 lipca 2025", message: "Twoja historia z tego dnia...", section: "film" },
  { src: "/photos/6A3437DC-9F20-4385-9294-959FE78C1875_1_105_c.jpeg", date: "18 sierpnia 2025", message: "Wpisz tu coś od serca...", section: "film" },
  { src: "/photos/545B4529-4FB7-428D-B46E-5393B01AAD3C_1_105_c.jpeg", date: "7 października 2025", message: "Czym jest dla Ciebie ta chwila?", section: "film" },
  { src: "/photos/62EF201B-E668-45F0-A6A6-D1F5CF62925D_1_105_c.jpeg", date: "15 stycznia 2026", message: "Powiedz coś pięknego...", section: "film" },
  { src: "/photos/53354A13-0852-47CE-97EC-3CA33F78468B.jpeg", date: "13 lutego 2026", message: "Ostatnie słowa miłosnego listu...", section: "film" },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = req.headers["x-registration-key"] || req.query.key;
  if (key !== process.env.REGISTRATION_KEY) {
    return res.status(401).json({ error: "Invalid key" });
  }

  try {
    const existing = await sql`SELECT COUNT(*) as count FROM photos`;
    if (Number(existing.rows[0].count) > 0) {
      return res.status(200).json({ ok: true, message: "Photos already seeded", count: existing.rows[0].count });
    }

    for (let i = 0; i < seedPhotos.length; i++) {
      const p = seedPhotos[i];
      await sql`
        INSERT INTO photos (src, date, message, section, added_by, sort_order)
        VALUES (${p.src}, ${p.date}, ${p.message}, ${p.section}, 'system', ${i})
      `;
    }

    return res.status(200).json({ ok: true, message: "Seeded photos", count: seedPhotos.length });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
