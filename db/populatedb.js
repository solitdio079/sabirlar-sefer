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
    sefer_qty NUMERIC
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