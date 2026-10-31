# Promptpath

Pelimäinen suomenkielinen promptaamisen oppimisympäristö. Rakennettu projektin React 19-, TypeScript-, Vite-, Hono- ja Cloudflare Workers -teknologioilla.

## Käynnistys

Node.js 22.19 tai uudempi.

~~~sh
npm ci
npm run dev:demo
~~~

Avaa http://localhost:5173. Demotila ei arvioi laatua eikä lähetä prompteja palvelimelle. Se sallii etenemisen kokeilun vapaasti. Demo ja oikea arviointi tallentavat etenemisen erikseen selaimeen. Oikea arviointi: npm run dev. Gemma 4 tarvitsee Google AI Studio -API-avaimen. Kehityspalvelin kutsuu Googlen etäpalvelua oikeassa arviointitilassa.

## Oppimispolku

Kahdeksan tasoa: tehtävä, taustatiedot, vastausmuoto, rajat, esimerkit, tarkentavat kysymykset, aineiston erottaminen ja luotettava kokonaisuus. Jokaisella tasolla on opetus, esimerkki, harjoitus ja vinkki. Kaikkien kriteerien täyttyminen avaa seuraavan tason. Virhe tai epäkelpo mallivastaus ei avaa tasoa.

- src/react-app: React-käyttöliittymä, palaute ja selaimen etenemistallennus.
- src/shared: tyypitetty opetussisältö ja arviointisopimus.
- src/worker: Hono POST /api/evaluate, Google Gemma 4, syöterajat, CORS ja IP-rajoitus.

## GitHub Pages + Cloudflare

1. Kirjaudu: npx wrangler login.
2. Lisää wrangler.json-tiedoston ALLOWED_ORIGINS-asetukseen GitHub Pages -alkuperä, esim. https://kayttaja.github.io. Älä lisää repon polkua. Useat alkuperät erotetaan pilkulla.
3. Suorita npm run build ja npm run deploy. Cloudflare tarjoaa API:n ja haluttaessa myös käyttöliittymän. Ennen julkaisua tallenna Google AI Studion avain komennolla npx wrangler secret put GEMMA_API_KEY. GEMMA_MODEL-asetus wrangler.json-tiedostossa on gemma-4-26b-a4b-it; vaihtoehto on gemma-4-31b-it. API:n käyttöehdot ja kiintiöt määräytyvät Google-tilin mukaan.
4. Aseta GitHub-repon Settings → Secrets and variables → Actions → Variables -kohtaan VITE_API_URL = julkaistun Workerin osoite ilman /api-polun osaa.
5. Valitse Settings → Pages → Source → GitHub Actions. Main-haaran push julkaisee frontendin mukana olevalla työnkululla. Muuta haara tarvittaessa.

npm run build:pages tuottaa staattiset tiedostot dist/pages-hakemistoon suhteellisilla resurssipoluilla. Cloudflare-plugin säilyy normaalissa kehityksessä ja Worker-buildissa, mutta on pois Pages-buildista. Jos API-osoite puuttuu Pages-buildista, oikea arviointi ei toimi; sitä ei vaihdeta hiljaa demoksi.

Erillisen API:n osoitteen voi asettaa .env.local-tiedoston VITE_API_URL-muuttujaan. Älä lisää salaisuuksia julkisiin VITE_-muuttujiin. .env.example näyttää asetukset.

## Tarkistukset

~~~sh
npm test
npm run build
npm run build:pages
~~~

Testit tarkistavat arvioinnin validoinnin ilman maksullista mallikutsua. npm run cf-typegen päivittää Cloudflaren tyyppimääritykset binding-muutosten jälkeen.

## Pohjan rajat

Eteneminen on selaimen localStoragessa ja käyttäjän muokattavissa. Luotettu suoritusrekisteri ja laitteiden välinen synkronointi vaativat kirjautumisen ja palvelintallennuksen, esimerkiksi D1:n. Tekoäly voi erehtyä: kalibroi arviointi oikeilla suomenkielisillä vastauksilla ennen laajaa julkaisua. Promptin sisäisten käskyjen torjunta on malliohje, ei ehdoton suoja.

API sallii 10 yritystä IP-osoitetta kohti minuutissa Cloudflaren likimääräisellä hajautetulla rajoittimella. CORS ei ole tunnistautuminen. Lisää ennen laajaa lanseerausta Turnstile tai käyttäjäkohtaiset kiintiöt ja kustannusseuranta. Sovellus ei tallenna prompteja palvelintietokantaan; ne lähetetään Googlen Gemini API:n Gemma 4 -mallille. Lisää julkiselle palvelulle tietosuojaseloste. Worker-lokitus on oletuksena pois käytöstä.

## Gemma 4 -arvioinnin asetukset

Hanki avain [Google AI Studiosta](https://aistudio.google.com/apikey). Tuotanto: npx wrangler secret put GEMMA_API_KEY. Paikallinen kehitys: kopioi .dev.vars.example tiedostoksi .dev.vars ja täytä GEMMA_API_KEY. Avainta ei aseteta selaimeen tai VITE_-muuttujiin. .dev.vars on ohitettu Gitissä.

Toteutus käyttää suoraan [Googlen Gemma 4 REST API:a](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api), palvelimen aikakatkaisua ja vastauksen validointia. Katkennut, estetty tai epäkelpo vastaus ei avaa tasoa. Palvelun virhevastausta tai API-avainta ei näytetä käyttäjälle. Testit käyttävät API:n testikorviketta, eivät oikeaa avainta.

Pelillisyys: tasokartta, pelaajan arvonimi, neljä saavutusta, 100 XP kustakin uudesta tasosta ja hillitty suorituspalaute. Uusintasuoritukset eivät lisää XP:tä. Ulkoasu on tumma ja hillitty, ilman maskottia tai pelihahmoja.

## Kielet ja aloitussivu

Sivusto avautuu aina tutustumissivulle, josta valitaan suomi tai englanti. Valinta kattaa käyttöliittymän, kahdeksan oppituntia, arviointikriteerit ja Gemman palautteen. Kieltä voi vaihtaa harjoittelun yläpalkista. Eteneminen tallennetaan kummallekin kielelle erikseen, ja aiempi suomenkielinen eteneminen säilyy. API hyväksyy language-kentässä fi tai en; ilman kenttää oletus on fi.

## Ulkoasun ohje

[DESIGN.md](DESIGN.md) määrittelee pysyvän Parallax Storytelling -tyylin, värit, typografian, tarinan luvut, mobiiliasettelun ja saavutettavuuden. Tutustumissivu käyttää kerrostettua vieritystä tuetuissa selaimissa. Harjoittelu pysyy paikallaan luettavana. Järjestelmän liikkeen vähentämisasetus poistaa animaatiot.
