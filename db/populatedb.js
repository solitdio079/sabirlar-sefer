import { Client } from "pg"

const SQL = `
CREATE TABLE IF NOT EXISTS driver (
 id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
 tckn TEXT,
 name TEXT
);

CREATE TABLE IF NOT EXISTS sefer(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    price NUMERIC,
    name TEXT
);

CREATE TABLE IF NOT EXISTS odeme (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    sefer_date TEXT,
    sefer_id INTEGER REFERENCES sefer(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES driver(id) ON DELETE CASCADE,
    payout NUMERIC,
    sefer_qty NUMERIC,
    havale_sent BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE odeme ADD COLUMN IF NOT EXISTS havale_sent BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS feature_request (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    description TEXT,
    implemented BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personel (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    tckn TEXT,
    role TEXT,
    official_gross_salary NUMERIC NOT NULL DEFAULT 0,
    agreed_total_salary NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bordro (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    personel_id INTEGER REFERENCES personel(id) ON DELETE CASCADE,
    payroll_month TEXT NOT NULL,
    official_gross_salary NUMERIC NOT NULL DEFAULT 0,
    official_net_salary NUMERIC NOT NULL DEFAULT 0,
    agreed_total_salary NUMERIC NOT NULL DEFAULT 0,
    working_days NUMERIC NOT NULL DEFAULT 26,
    overtime_days NUMERIC NOT NULL DEFAULT 0,
    overtime_hours NUMERIC NOT NULL DEFAULT 0,
    advance_payment NUMERIC NOT NULL DEFAULT 0,
    icra_deduction NUMERIC NOT NULL DEFAULT 0,
    prior_cumulative_tax_base NUMERIC NOT NULL DEFAULT 0,
    minimum_wage_paid BOOLEAN NOT NULL DEFAULT false,
    salary_extra_amount NUMERIC NOT NULL DEFAULT 0,
    salary_extra_sent BOOLEAN NOT NULL DEFAULT false,
    payment_type TEXT NOT NULL DEFAULT 'Havale',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO sefer (name,price) VALUES 
('Inebolu 1 sefer', 500),
('Inebolu 2 sefer', 1100),
('Inebolu 3 sefer', 1700),
('Izmit Metanol', 2300),
('Tutkal Terme', 1500),
('Tutkal Terme 2', 1700),
('Kül nakliyesi', 1200),
('Dıvapen Tutkal', 1200),
('Masraf', 100),
('Adblue', 100),
('Samsun Manisa Turgutlu Gübre', 100),
('Manisa Balıkesir ahşar atık', 100),
('Yatma', 100),
('Fabrika içi çalışma yarım gün', 250),
('Fabrika içi çalışma tam gün', 500),
('Koyuncuoğlu Tutkal', 1500),
('Iki Fabrika arası', 100);

INSERT INTO driver (tckn,name) VALUES 
('21596799390','AHMET BORA BASAK'),
('23936479160','ALAHİTTİN GÜL'),
('57808059990','BAYRAM ARSLAN'),
('27553983260','BERKAY KAYA'),
('54124184368','BİLAL KUŞÇU'),
('42547699422','BURAK ÖZDEN'),
('21143277456','CEMİL KELEN'),
('43327543584','ÇETİN TAŞCI'),
('41707597820','EMRE ÇELİKOĞLU'),
('44167519142','ERHAN DEMİR'),
('20114670562','FAHRİ ACAR'),
('47743396328','FARUK ÖZDEMİR'),
('45868814802','FURKAN BAŞ'),
('10880619520','GÖKHAN YALVAÇ'),
('39169682598','HAKKI DANACI'),
('47794750698','HALİL AYYILDIZ'),
('48175382132','MEHMET AYDIN'),
('32474261380','MESUT ŞAHİN'),
('59389008800','MUHAMMED ALPER KEŞKEKOĞLU'),
('21254273736','NAZIM KAPUCUOĞLU'),
('30571962070','NEVZAT ÇALIŞKAN'),
('11909591476','NURETTİN KURU'),
('45634822666','ONUR AKMAN'),
('54823153832','ONUR MADEN'),
('65491161036','ÖZGÜR BAL'),
('23213214446','ÖZKAN ALTINSOY'),
('18212380858','RECAİ KUŞGÖZOĞLU'),
('52279241608','SEDAT IŞIK'),
('43849880914','TANER DEMİR'),
('52720581550','TUNCAY KARAKOYUN'),
('32437906532','UĞUR HERKİL'),
('13415540924','UĞUR UÇAR'),
('10247640396','ÜMİT KÖKOĞLU'),
('33599202036','YAŞAR DİLEK'),
('57565214274','YAVUZ AKÇAY'),
('10874629412','YILDIRAY ÜNLÜ'),
('55510137388','YUNÜS ELMACI');

INSERT INTO personel (name,tckn,role,official_gross_salary,agreed_total_salary)
SELECT d.name, d.tckn, 'Şoför', 33030, 28075.50
FROM driver d
WHERE NOT EXISTS (
    SELECT 1
    FROM personel p
    WHERE p.tckn = d.tckn
       OR (p.tckn IS NULL AND p.name = d.name)
       OR (p.tckn = '' AND p.name = d.name)
);

`;

async function main() {
    console.log("seeding...");
    const client = new Client({
        connectionString: "postgresql://postgres:PGs5@HtP-94G.L3@db.ysubdnmehzfrntrfnwqk.supabase.co:5432/postgres"
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log("done");
}

main();
