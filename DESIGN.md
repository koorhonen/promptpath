# Promptpath — Parallax Storytelling

Tämä on projektin käyttöliittymän pysyvä visuaalinen ohje. Lue se ennen käyttöliittymän muuttamista. Säilytä tyyli myös uusissa näkymissä. Käyttäjän nimenomainen uusi ohje menee tämän tiedoston edelle.

## Suunta

Aikuiselle suunnattu, rauhallinen ja elokuvallinen oppimiskokemus. Vieritys rakentaa tutustumissivun tarinan. Harjoittelutila käyttää samaa väripalettia ja typografiaa, mutta sen teksti ja lomake pysyvät paikallaan. Ei maskotteja, sarjakuvahahmoja, lapsenomaisia palkintoanimaatioita, pastellipalettia tai lelumaisia kolmiulotteisia painikkeita.

## Värit ja tokenit

Värien ainoa lähde on src/react-app/index.css. Käytä CSS-muuttujia uusissa komponenteissa.

| Token | Arvo | Käyttö |
| --- | --- | --- |
| --night | #1A1A2E | Sivun pohja ja tummat sisältöpinnat |
| --navy | #16213E | Kortit, otsake ja työskentelypinnat |
| --deep-blue | #0F3460 | Valitut kohteet ja tarinan taustakerrokset |
| --rose | #E94560 | Suuret lukujen numerot, koristeet ja gradientin alku |
| --amber | #F39C12 | Korostukset, valinnan merkit ja gradientin loppu |
| --button-ink | #101122 | Painikkeen tumma teksti, kontrasti ruusunpunaisessa päässä yli 4.5:1 |
| --text | #FFFFFF | Pääteksti ja kohdistusrenkaat |
| --text-muted | #BFC6D7 | Toissijainen teksti, korotettu kontrasti alkuperäisestä #9CA3AF-väristä |
| --surface | #192743 | Mahdolliset lisäpinnat saman paletin sisällä |
| --border | #566683 | Reunat ja erottimet |
| --accent-text | #FFB6C3 | Pieni korostusteksti; raakaa ruusunpunaista ei käytetä pieneen tekstiin |

Älä tummenna koko suunnitelmaa korjataksesi yksittäistä kontrastia. Käytä värin vaaleampaa tekstiversiota tai tummaa tekstiä värillisellä pinnalla. Gradienttipainikkeen teksti on --button-ink, ei valkoinen. Viiteohjeen --night jäi ruusunpunaisessa päässä arvoon 4.46:1; painiketekstiin käytetään siksi tummempaa #101122-väriä. Valitun sinisen pinnan pienet tekstit ovat valkoisia. Värin lisäksi valinta ilmaistaan reunalla ja radiomerkillä, suoritukset tarkistusmerkillä ja tekstillä.

## Typografia ja mittakaava

- Leipäteksti: Inter, Segoe UI, system-ui, sans-serif. Ei ulkoista fonttilatausta.
- Metatiedot, numerot ja esimerkkipromptit: ui-monospace, Consolas, monospace.
- Tutustumissivun pääotsikko: 50–100 px työpöydällä, 40–68 px pienillä näytöillä. Tiivis riviväli 1.04, paino 600.
- Lukujen otsikot: 38–76 px. Lukujen koristeelliset numerot: 100–240 px.
- Tarinan leipäteksti: 18 px, pienellä näytöllä 16 px, riviväli noin 1.9. Tekstipalstan leveys enintään 36 rem.
- Harjoitusten leipäteksti: 14–15 px. Lomake ja esimerkit: 13 px. Metatiedot: 9–12 px.
- Gradienttiotsikko .title on inline-block, riviväli 1.1 ja alapadding .12em. Älä leikkaa kirjainten alaosia overflow:hidden-asetuksella.

## Tutustumissivun rakenne

1. Tahmea .story-header: brändi ja aina käytettävissä oleva Suomi / English -ankkuri. Kielen valintaan pääsee suoraan lukematta koko tarinaa.
2. .chapter-hero: nykyinen esittely, otsikko ja opetussisällöstä lasketut luvut: harjoitusten kokonaismäärä / 02 kieltä / ääretön.
3. Kolme .chapter-step-lukua: Ymmärrä periaate, Kirjoita oma promptisi, Kehitä ja etene. Kussakin suuri numero sekä nykyinen lyhyt selitys.
4. .chapter-language: nykyinen kielivalinta, tallennettu eteneminen ja aloituspainike.
5. Nykyinen lopputeksti.

Älä keksi asiakaspalautteita, tilastoja, hintoja, kuvia tai muuta sisältöä visuaalisen tyylin täytteeksi. Uudelleenjärjestä vain olemassa olevaa sisältöä, ellei käyttäjä pyydä uutta.

## Kerrokset ja liike

- .welcome-page luo oman kerrospintansa isolation:isolate-asetuksella.
- .backdrop: kiinteä, koristeellinen bränditeksti, --drift: -10vh.
- .midground: kiinteä ruusunpunaisen ja sinisen radiaaligradientin kerros, --drift: -30vh.
- Molemmat taustakerrokset: pointer-events:none, aria-hidden=true, sisällön takana. Ne eivät saa peittää ohjaimia.
- .chapter: vähintään 100svh työpöydällä; sankarin korkeus vähentää otsakkeen korkeuden. Taustagradientit jatkavat toisiaan.
- .chapter-number on työpöydällä sticky; .chapter-copy liikkuu normaalin vierityksen mukana.
- .reveal käyttää CSS view timeline -animaatiota: entry 0% → entry 60%, pystysiirtymä 40 px → 0. Tekstin peittävyyttä ei vähennetä, jotta kontrasti säilyy myös still-kuvissa ja animaation alussa.
- Syvyyskerrokset käyttävät CSS scroll timeline -animaatiota @supports-lohkon sisällä. Ei scroll-eventtejä, jatkuvaa React-tilan päivittämistä tai raskasta animaatiokirjastoa.
- Jos selain ei tue animaatioaikajanoja, sisältö näkyy normaalisti. Ei JavaScript-riippuvaista paljastamista.
- Ei scroll hijackingia, pakotettua scroll snapia tai autoplay-mediaa.

## Harjoittelunäkymä

Tasopolku, XP, saavutukset ja arviointilomake pysyvät toiminnallisesti ennallaan. Harjoittelu ei käytä parallaxia tai scroll reveal -animaatiota. Sama navy-pohja, rose–amber-korostukset, pyöristetyt toimintopainikkeet ja selkeä typografia sitovat näkymät yhteen.

Älä muuta kielikohtaista etenemistä, tehtävien kriteerejä, Gemma-arviointia tai palautteen toimintaa ulkoasutyön yhteydessä.

## Responsiivisuus ja saavutettavuus

- Alle 780 px: tavallinen pystysuora dokumentti, lyhyemmät sisältöluvut, ei kiinteitä parallax-taustoja, ei sticky-lukunumeroita eikä reveal-animaatiota. Mobiilia ei pakoteta pitkään koko ruudun vieritykseen.
- prefers-reduced-motion: reduce: ei taustakerroksia eikä animaatioita, ei pehmeää vieritystä, lukujen korkeus sisällön mukaan ja otsake normaalissa dokumenttivirrassa.
- Print: ei parallaxia, valkoinen pohja ja tumma teksti.
- WCAG AA: tavallinen teksti vähintään 4.5:1, suuri teksti vähintään 3:1. Tarkista gradienttien molemmat päät ja valitut/hover-tilat.
- Näkyvä 3 px valkoinen focus-visible-kehys ja 5 px väli. Radiokortti saa focus-within-kehyksen.
- Painikkeen ja aktiivisen radiokortin kosketuskorkeus vähintään 44 px. Kenttien nimet ovat näkyviä.
- Käytä oikeita painikkeita, linkkejä, fieldset/legend-rakennetta ja radio-inputteja. Älä tee koristeellisista elementeistä tabulaattorikohteita.
- Koristeelliset numerot ja taustat ovat aria-hidden. Säilytä status-palautteet ja kohdistuksen siirtyminen harjoituksen otsikkoon.
- Kaikki käyttötekstit ovat suomeksi ja englanniksi nykyisen kielivalinnan mukaan. html lang ja sivun otsikko seuraavat valintaa.

## Toteutuksen sijainnit ja tarkistus

- src/react-app/index.css: tokenit ja globaalit saavutettavuussäännöt.
- src/react-app/App.css: tarinan kerrokset, luvut ja harjoitusten tyylit. Suosi lyhyitä nimettyjä luokkia pitkien rakennevalitsimien sijaan.
- src/react-app/App.tsx: nykyinen sisältö ja toiminta.
- src/react-app/translations.ts: harjoittelun käännökset.

UI-muutoksen jälkeen varmista TypeScript/build sekä tarkista selaimessa tutustumissivu, kielivalinta ja harjoitus. Tarkista myös pieni näyttö, näppäimistökohdistus ja liikkeen vähentäminen, kun esikatselutyökalut tukevat niitä. Älä lisää toteutusta peilaavia testejä pelkkään CSS-muutokseen.

## Oppimisluokat

Kielen valinnan jälkeen avautuu .course-main-luokkavalinta. Neljä .course-card-korttia käyttää samaa navy-pintaa, rose-yläreunaa ja amber-metatietoja. Luokkavalinta ja harjoittelu pysyvät ilman parallax-liikettä. Luokan nimi ja Vaihda luokkaa -painike näkyvät harjoituksen sivupalkissa. Luokilla voi olla eri määrä tasoja: näytä todelliset luvut, älä kovakoodaa kahdeksaa tasoa. Tallenna eteneminen kielen ja luokan mukaan; perusteiden vanhat tallennusavaimet säilyvät.
