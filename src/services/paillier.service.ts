import { PrivateKey, PublicKey, generateRandomKeys } from 'paillier-bigint';
import { Paillier } from '../interfaces';

export const getPublicKey = (n: bigint, g: bigint) => new PublicKey(n, g);
export const getPrivateKey = (lambda: bigint, mu: bigint, publicKey: PublicKey) => new PrivateKey(lambda, mu, publicKey);

const generatePaillierKeys = async (): Promise<Paillier.Keys> => {
    const keys = (await generateRandomKeys()) as unknown as Paillier.Keys;
    return { publicKey: keys.publicKey, privateKey: keys.privateKey } as Paillier.Keys
}

/* global BigInt */
function paillerEncrypt(plaintext: bigint, publicKeyComponents: PublicKey): bigint {
    const n = BigInt(publicKeyComponents.n), g = BigInt(publicKeyComponents.g)
    console.log(`n:`, n)
    console.log(`g:`, g)
    const publicKey = getPublicKey(n, g);
    return publicKey.encrypt(plaintext);
}

async function paillerDecrypt(ciphertext: bigint, publicKeyComponents: Paillier.PublicKey, privateKeyComponents: Paillier.PrivateKey) {
    const n = BigInt(publicKeyComponents.n)
    const g = BigInt(publicKeyComponents.g)
    const lambda = BigInt(privateKeyComponents.lambda)
    const mu = BigInt(privateKeyComponents.mu)
    ciphertext = BigInt(ciphertext)
    const publicKey = new PublicKey(n, g);
    const privateKey = getPrivateKey(lambda, mu, publicKey)
    return new Promise((resolve, reject) => {
        const dec = privateKey.decrypt(ciphertext);
        setTimeout(() => {
            resolve(dec);
        }, 1000);
    })
}

async function paillerAddition(ciphertext1: bigint, ciphertext2: bigint, publicKeyComponents: PublicKey) {
    const n = BigInt(publicKeyComponents.n)
    const g = BigInt(publicKeyComponents.g)
    const publicKey = new PublicKey(n, g);
    return new Promise((resolve, reject) => {
        const result = publicKey.addition(ciphertext1, ciphertext2)
        setTimeout(() => {
            resolve(result);
        }, 1000);
    })
}

const test2 = async () => {
    const publicKeyComponents = {
        g: `15239208472093432891095090307213004741604627168000026251897049571052207543238516868626361696405746409420010583717011379338826611592814698234838922494156507471047377687439409672220194212848244868348086596130292682719330494295342369883607597109018976049260958028634754408945695097763865486692531677504731756010031553006414036675141164417570286591424611477531979208336757374383697434057668552615906302416102487897850961629398214004284159592132549602319870971532157975692789801124849721214614558984630018344622505251778559203243671606518291231803356703746061670135278677745967300673947027873737133705353002823447370344860769494430177960758593047304556912914930458615107481691413035504737408099482289497301123953494512687818206220367395063311041255068557151217576197238206249878118272925398931074038857654558981185874394673504539810716344084421525169327686314616868923178237081779019515484304631719694229145641250217316194711925045368780619259903333465944929986263067312464661225163187138018613875026917049349325962370929096700009483392409181001197624506681443034588944730996710003286201944209540812833446816385070305391891249841761395734816535038922235901514726752615108939201364394791026906014848257286250187052474555028758348791037152001828656505725419598878179410953811694336969911077249876153407394244243029551843141932444101082862319839830179618048705369826033983212540656580107724194536989241324047665589927219820095889300186189965101611154630066065059705044984956884457957953624991131692026819417359257940353514998059190022291787203335409943267244778690751174764665314443981392874615363137112877870446376904260182716678721474907480496609718005365990718158908826497477149903178521102302185234629086999188773647940339230589643403035227923487634939488923692062134470850855574677721876408430061537826116901958895643515398496125417005035535293498843554`,
        n: `4936955969666879930047424490685923254483008324911395942365884436589562376033924750383656464617036583435101603731211079710425903605000009467279916583935211016054754224480261794043383439122607499530902924250503886443934311948958377142534016754164000681413941694241280751764773541002886993738614341898004995755083100772085890546838240042136924839751410959404613643718451779268965159412384737236298931153463657293299946101106632796356733552383513267852131170702071686615095579015303117300146159661481884878659268608603837550447478447873261225598547686704880877730988003878436202278983020703325989618449025447652381531158435031805098403176248204519087110896519201168583748560162536094052543643927810912997709996815457753858021398133360960909255536677891530961656873544634475318290130633451092268020860194704806041679251629964948025407177622716169138870388095283805271245574979390862096348270809649055625597367135654742395680245643`
    }

    const privateKeyComponents = {
        lambda: `822825994944479988341237415114320542413834720818565990394314072764927062672320791730609410769506097239183600621868513285070983934166668244546652763989201836009125704080043632340563906520434583255150487375083981073989051991493062857089002792360666780235656949040213458627462256833814498956435723649667499292513850128680981757806373340356154139958568493234102273953075296544827526568730789539383155192243942882216657683517772132726122258730585544642021861783678613675531439632005966523520800177649495654062226456309378040189996047804512596679748540800234565872971160866476113746595778027547667380192192737649910419381889721657847375015908630767428098451539653143773440688811592554546703380428871187806458291044591265760866691505232774841135817404242786110273933415686691911626737847178071529354762117393570500333045713926915695710702321358267823916179016224823388438161094341931819742047223436984863135217977804524468536247988`,
        mu: `4505417549513024417151498994371794151255787008889024187012576070765036386741524589988720443257778046258973054943142677144786605465672707421316313820487696853184643625804967529415646461807760060668061370162085921112370821346266349506529033420900743204082769902653673275940266059760097526135324868466959251958142501333921997889802583400752077937448345065679593181009404297579255233853668729969889474013133392806999464094466992393666287053833707814065564983449234911257318810716276318225357838441367060174325731669822823719974503028030422498142947714185373545971332461902876602766856746310513030352122750541692508806467635008869756452647218213480539762134003372546660041207312021341326614519974117696133392931651323505580719471105464358147953285757470466853379516097113653538244007683422591665263405064624348091495634970742416715153294661535701506873391737613877724808487383997171485724811929580531410944496165852649338984456445`
    }

    const cipher = `18650718600234049615773451319777134822701002356479812628767169450994582501704862796256983594027307531788554145865749998139146526597690799840151301207788832099069320043515205097541198081946021243857876583050653633502415258833796976143862616195856521450049508258410326819933796391538267372715229534894914106331837845098858596757260891433841200624458341378293277577928026553292384985311380504029295929030553946897364897023994144627798619781410568326429395672496478906713602766440004505368911912096050573990817622615132643364714718385905327752059585144601299022848431742843271002299482842225200283986983300871746217488595973843407836644256542730653719187726301182985608825249828817963997953129269526665411604109135484282074791967359286692992561255669705459278677981525442334143328038819452924052698012701524610221681234820328198901752618725945005909034312311863246901041713029298105350932230635667458941757700488846027652008023808493816378448604263218726690772055153481616568345663453704195048479523982773971613308601671794243802138911060022762471428578828725947859943505013791758556517450060716661969181197447971460130550867511885634980724491605524249915813150557038391849146713659029096632266689101762646549698675625239294879518979759805930417260891862397786939975992570531529056165278383459380928673822680571915935477124663947426218573591630685280196881153201807265698311463728747822554859743471342936543342783464949008662997715479572615469543194646034414485764051532288331063357695363873946149805217020926155372536872944949901365759146727067315459386780127571911663286034326720324673291959231051866687215608745434853940526035085122409896735897535041665775460869757078099764985413011483660440604742067616019018912728719367311884805347023228219741766164070714487805937805160997095581133555463929744219559145781912471830391449852652769479893464825230444`
    const decrypted = await paillerDecrypt(BigInt(cipher), publicKeyComponents, privateKeyComponents);
    console.log({ decrypted });
}

// const test2 = async () => {
//     console.log(await generatePaillierKeys());
// }

// test2();

// const test = async () => {
//     const { publicKey, privateKey } = (await getElection(`0c5eea33d52d422b82c2c91f21e78505`)).publicKey;
//     console.log(`pkpk`, publicKey)
//     console.log(`sksk`, privateKey)
//     // const publicKeyComponents = {
//     //     n: `3667146427822461143816532955001628511643216195637257441828251284043273507671592723939420724385447018600041606128566449918163583440843850357477958697179103684592377729660864670951020577980690153069361187775923064765343394350414041256270914540700435434367018940981534801109402693714752915719104968229626587896776758279113759800771102142347606682327869418389438212739347070928315627707274666958302210761071652068869780107592316110945455182286371885169058921523877398663663974465541658567156880433205072192880759197713527598604999443533099188235702806233257691967502992644879035671458277796829161448497627318186637307091870924464547776118898343381738413604774818095966813191714939998372293558032350794001425881330007038928644431949105935662180791480641574636907418444952404486482223580255020181484974788023104255842487022836468821992478783865057259943509916406419132910532623671581180957088651786609185914524192895314363033786019`,
//     //     g: `7974292268328679672576728020160632124525915585998728900944712289312187310830622012558265395582588613378212161703403085816069966406956278453395337594778406492867851526711713323196216716255341945385550120099924161822231081763157047780293319806450846527263803204593070840590720270359913814982406609352528933928545393983934235342967578372469714211759482576612981014523844251190833076921836419483222574454409392157248338830438726758270904409843122046054832021924445632886200054432771955205537486960757541791680458314565915736623511029079881038124870210630784138497363644127058994100685713735554954638147380941388917205514039467132390622830805166183506860787011916961858329505500394218651554305909775917347069622309373815482267761445341709628219329557915708295821550124513352865629857093179557226111459278989354491906330493633657408891067990709152722423197715291253441153888306942189444428398461139217057871446527077523681963909734887828903477988510610119545703622158354896185748014160164082387346692940418422305431460809387025550653873439810174805392108379388962459226644792009210030908979612953944556697151949557901089940265819448550135408309986570457862565602505172111345788535217470156505395001228086563594272895514842784218607054418445344302964364538617614394681591765732710082645050998084519477612105108890614300602437781913494306045148769384239922109721969093500699821234297241252140224424538894889119005272857736709462985205744306925426421864575599196350822444802802362659932176030692962926709489393955748217572895684145384526321288210544678839620952179819025664810800222949458073259038262063020529667564290955761168221254378544577809511713374416437381995961114826245797063813332794561168153451820989054756749061292749339216962453332358713065310573201616136847100876661866424167401012065464612131028999450445101888027624450960918174036337489248997`
//     // }
//     // const privateKeyComponents = {
//     //     lambda: `1833573213911230571908266477500814255821608097818628720914125642021636753835796361969710362192723509300020803064283224959081791720421925178738979348589551842296188864830432335475510288990345076534680593887961532382671697175207020628135457270350217717183509470490767400554701346857376457859552484114813293948388379139556879900385551071173803341163934709194719106369673535464157813853637333479151105380535826034434890053796158055472727591143185942584529460761938697341558462532427499804695163991848000236764703109775394478782069915558078039514119539237388534338842610428693963100697737315802593164137720794595242698846142579021804796400089176214039089239914457019739014968546296297156195221277257980445859773420983657053254893016296356889718008354037340287676688913597792999375286655076535986212800718974193107325240359521274114752637448239277238113567686056303861825563437371609716404591542382393379579575464901706767199499060`,
//     //     mu: `3427706668078022752597178340307506571982633002302652421519278762450764555255185930190528649499608719144788731099857196176140037879508261909579180630730393809874608983527750079511151450496852621859020549995117796481579902442491745602205815633614638046668038866717047238846409997577700869465475213461593208041047049689671526128229457356610069538899951317644789580619628113890317131570184676647637182989644661715229450760981211035003770641229862950969896735594520046630159475635344424724413784960548157296903822378769028312091699245388128920648822655395738803037662016516770936346634414613749564769192667834566145471218801964961431783950509242632360748144014179847673159870670305184451316239018220714874990705331227190779860580044640406382587680972048310767734371186277408415055032381257640301013561362415918016174046101706005761188980440738649140402925630796429374395628450277075441037579281969422286812365194258450854436439750`
//     // }
//     const ciphertext = paillerEncrypt(1, publicKey);
//     console.log(`ciphertext:`, ciphertext)
//     const ciphertext2 = paillerEncrypt(1, publicKey);
//     console.log(`ciphertext2:`, ciphertext2)
//     // const { publicKey, privateKey } = await generateRandomKeys(3072)
//     // console.log(`n:`, publicKey.n.toString())
//     // console.log(`g:`, publicKey.g.toString())
//     // console.log(`lambda:`, privateKey.lambda.toString())
//     // console.log(`mu:`, privateKey.mu.toString())
// }



// test();

export { paillerEncrypt, paillerDecrypt, paillerAddition, generatePaillierKeys }