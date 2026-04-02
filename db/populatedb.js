import {Client} from "pg"

const SQL =`
CREATE TABLE IF NOT EXISTS malzeme (
 id UUID PRIMARY KEY  DEFAULT gen_random_uuid(),
 price NUMERIC,
 name TEXT
);

CREATE TABLE IF NOT EXISTS sefer (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
driver_name TEXT,
malzeme_id UUID REFERENCES malzeme(id) ON DELETE CASCADE,
CONSTRAINT fk_sefers_malzeme
FOREIGN KEY (malzeme_id)
REFERENCES malzeme(id)
ON DELETE CASCADE,
pay_type TEXT,
date TIMESTAMPTZ,
total_payout NUMERIC,
sefer_qty INTEGER
);

INSERT INTO malzeme (name,price) VALUES 
('KASTAMONU KÜL', 1500),
('KASTAMONU SAMSUN TEHLİKELİ MADDE', 500),
('KASTAMONU ISTANBUL AHŞAP', 200);
`;

async function main(){
    console.log("seeding...");
    const client = new Client({
        connectionString: "postgresql://postgres:JSGhqi8jBqubHG-@db.snogtuetsolyxwpqqsmb.supabase.co:5432/postgres"
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log("done");
}

main();