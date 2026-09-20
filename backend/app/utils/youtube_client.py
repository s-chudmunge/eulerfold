import httpx
import logging
import math
import re
import os
import cohere
from typing import List, Dict, Optional, Set
from app.core.config import settings

async def generate_embeddings(texts: List[str]) -> List[List[float]]:
    api_key = settings.COHERE_API_KEY or os.getenv("COHERE_API_KEY")
    if not api_key:
        raise RuntimeError("COHERE_API_KEY not configured")
    
    co = cohere.AsyncClientV2(api_key=api_key)
    response = await co.embed(
        texts=texts,
        model="embed-english-v3.0",
        input_type="search_document",
        embedding_types=["float"]
    )
    return response.embeddings.float

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0 or norm_b == 0: return 0.0
    return dot_product / (norm_a * norm_b)

logger = logging.getLogger(__name__)

# Trusted educational channels (lowercase for case-insensitive matching)
TRUSTED_CHANNELS = frozenset([
    "3blue1brown", "5 minutes engineering", "abdul bari",
    "academind", "advanced maths", "advanced physics",
    "ae5x", "ahq associates", "ai study hub",
    "aikido security", "akshay saini", "alan beary",
    "alex hyett", "algorithm avenue", "algorithms live!",
    "ali hajimiri (academy)", "all about electronics", "all electronics channel",
    "all your tech ai", "allen institute for ai", "amazon web services",
    "amlan das", "andrej karpathy", "andrey k",
    "angel poon", "animations xplaned", "aqua security open source",
    "arjancodes", "artem mishchenko", "arun tyagi",
    "arvin ash", "arxiv insights", "ask leo!",
    "asr2020", "assemblyai", "atoms to materials",
    "aws training center", "back to back swe", "badis ydri | quantum",
    "beaufort tek", "behzad razavi (long kong)", "ben eater",
    "ben langmead", "berkeley riselab", "beyond the big bang",
    "bhadeshia123", "bhavani hazaru", "bindas physics",
    "binod suman academy", "bio scholar", "biolumination ",
    "biomechatronics lab", "blackpenredpen", "blaise pascual",
    "boosty labs", "bozeman science", "brackeys",
    "brian douglas", "bytebytego",
    "caleb curry", "caltech", "carnegie mellon university",
    "chainlink", "chalana kariyawasam", "chandan physics",
    "chem4432", "chemistnate", "chemistry untold",
    "chicken puck's quantum computing tutorials", "chris alexiuk", "christopher okhravi",
    "chung-sang ng", "classical mechanics", "cloud guru",
    "cloudenthusiasts", "cmu database group", "cnslab iitm",
    "codeai", "codebasics",
    "codeopinion", "coderone", "codetav management",
    "codevault", "codevolution", "codewrinkles",
    "coding by shailja", "coding in flow", "computer&electronics",
    "computerphile", "condensed matter cat", "confluent developer",
    "content-academy", "corey schafer", "cornell university",
    "corporate taleem", "coursejet", "coursera",
    "crashcourse", "creel",
    "cs & it tutorials by vrushali 👩‍🎓", "cs dojo", "cs50",
    "cybernetic systems and controls", "cyrill stachniss", "daily code buffer",
    "dan fleisch", "danish mustafa ", "darrenongmath",
    "darryl morrell", "data mozart", "databases a2z",
    "databricks", "dave your tutor", "david bombal",
    "david holcman", "david silver", "decomplexify",
    "deep space declassified", "deeplearningai", "deeplizard",
    "derek banas", "devaraj umapathi", "developers checkpoint",
    "devops shack", "digikey", "digital signal processing",
    "domain of science", "dorian mcintire", "dors coding school",
    "dot physics", "douglas hundley", "dr. harish garg",
    "dr. joshua paul steimel", "dr. physics a", "dr. shane ross",
    "dr. trefor bazett", "dr.sonia dahiya", "duniya drift",
    "dwbiadda videos", "ec academy", "ece by mvk",
    "eduphile", "edureka!", "edx",
    "eeknowhow", "eevblog", "eigenchris",
    "ekeeda", "electric simplified", "electrical engineering authority",
    "electroboom", "electronics with professor fiore", "ellipsis projects",
    "emcapsulation", "empossible", "engineering funda",
    "engineering with prof. kim", "engineering with utsav", "engrtutor",
    "essence of reality", "evan thacker", "explorer",
    "faculty of khan", "fastai", "felixtechtips",
    "fermilab", "finematics", "firebase",
    "flammable maths", "foe asu 2nd electrical 20", "for the allure of physics",
    "frank wong", "franklychemistry", "freecodecamp.org",
    "freelanceteach", "gate crackers", "gate smashers",
    "gaurav sen", "georgia tech", "google cloud tech",
    "google deepmind", "google techtalks", "gradphys with prof. kshetri",
    "grant lathrom", "grasp engineering", "greenleyf",
    "greg hogg", "grs_chem", "g‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ",
    "hackerrank", "hallow teaches stuff", "hamscript",
    "harvard", "harvard cs50", "harvard university",
    "hello byte", "himanshu gaur", "hugging face",
    "huggingface", "hussein", "hussein nasser",
    "hydra", "hyperautomation labs", "iain explains signals, systems, and digital comms",
    "ibm technology", "ictp", "ictp condensed matter and statistical physics",
    "iit bombay", "iit kanpur-nptel", "iit kharagpur",
    "iit madras - bsc degree programme", "iit roorkee", "iit roorkee july 2018",
    "insights into mathematics", "institute for advanced study", "institute of astronomy, ku leuven (belgium)",
    "intellectually curious podcast", "intermation", "inyima nicholas studio",
    "ippsec", "isaac amornortey yowetu", "jacob sorber",
    "jake wright", "james battat", "jaya krishna",
    "jeff hanson", "jeffrey chasnov", "jenny's lectures cs it",
    "jeremy howard", "john hammond", "john levine",
    "josh miles", "josh's channel", "jsconf",
    "kec ece acumen", "keso rupert", "kevin powell",
    "khan academy", "khan academy india - english", "kimberly brehm",
    "kit betts-masters", "knowbee", "kodekloud",
    "kompile", "konstantinos anagnostopoulos", "kreatryx gate - ee, ece & in by unacademy",
    "krish naik", "kudvenkat", "kurzgesagt – in a nutshell",
    "lakhani stem tutorials", "lasseviren1", "leah4sci",
    "leann faidley", "learn and grow", "learn life science",
    "learncheme", "learnopencv", "lectures by walter lewin. they will make you ♥ physics.",
    "leigh halliday", "leonard susskind", "less boring lectures",
    "let's get rusty", "lively karthik", "liveoverflow",
    "lseinjr1", "lucius fox", "luis serrano academy",
    "mafarooqi", "mahmood ul haq", "maksym levinskyi",
    "manocha academy", "marblescience", "mark rober",
    "martin fowler", "martin kleppmann", "math at andrews university",
    "math the beautiful", "math visualized", "mathemaddicts",
    "mathematicalmonk", "mathmajor ", "mathologer",
    "math with mr. j", "math antics", "brian mclogan", "tabletclass math",
    "mario's math tutoring", "nancy pi", "profrobbob", "kristakingmath", "tarrou's chalk talk",
    "mathosy guru - rajiv patel", "maths partner", "matthew donahue",
    "matthew salomone", "maurits haverkort", "maven silicon",
    "mcoding", "megr438", "meikanda sivam",
    "melissa maribel", "menneedtobeheard", "michael kitas",
    "michael penn", "michel van biezen", "microsoft research",
    "milan jovanović", "minutephysics", "mission physics",
    "mit opencourseware", "mitcbmm", "mitk12videos",
    "mrjakob", "mycodeschool", "neal wu",
    "neetcode", "neso academy", "net ninja",
    "networkchuck", "networking made easy by t s srinivas", "neuralnine",
    "nextrie", "nick", "ninja nerd",
    "nj wildberger", "node.js", "normalized nerd",
    "nptel", "nptel iit kharagpur", "nptel-noc iitm",
    "nptelhrd", "null labs", "numberphile",
    "nutshell", "oktadev", "online darsgaah",
    "organic chemistry with victor", "oxford mathematics", "oxford ml and physics seminars",
    "oxylabs", "pankaj physics gulati", "parth g",
    "patrick j", "patrickjmt", "pbs infinite series",
    "peetha academy ", "perimeter institute for theoretical physics",
    "pganalyze", "philipp lackner", "photovoltaics explained",
    "phys whiz", "physical chemistry", "physics almanac",
    "physics online", "physics videos by eugene khutoryansky", "physics with andrés aragoneses",
    "potentialg - csir net | gate | tifr physics", "pretty much physics", "princeton university",
    "prof. van buren", "professor dave explains", "professor leonard",
    "professor messer", "programming with mosh", "pytorch",
    "qiskit", "quanta institute llp", "quanta magazine",
    "quantum data analytics", "quick biochemistry basics", "rajeshmon v g",
    "ravindra soni health & wellness", "reducible", "reumi's world",
    "richard sutton", "ritvikmath", "sa7man",
    "sam witteveen", "sanjay choudhary", "sanju physics ",
    "sasthra", "scalenescott", "science abc",
    "science simplified", "scienceclic english", "seamlessblend",
    "sean allen", "seattle data guy", "sebastian lague",
    "sebastian wild (lectures)", "sebpic", "seeker",
    "seibert group (english)", "sentdex", "sergey frolov",
    "shailza kant pandey", "shomu's biology", "simons institute",
    "simplilearn", "simply explained", "simulationkart (formerly matlab school)",
    "sky scholar", "socratica", "software with shawn",
    "solid state physics in a nutshell", "space explainer", "spin electron",
    "stanford", "stanford computer science", "stanford institute for theoretical physics",
    "stanford online", "statquest with josh starmer", "statscast",
    "stephane maarek", "steve brunton", "steven brunton",
    "striver", "strong medicine", "students of chemistry",
    "sunny classroom", "tableau", "take u forward",
    "tantan", "teacher e", "tech by sensei kushagra",
    "tech primers", "tech with nader", "tech with tim",
    "techeducation 4u", "techpapers", "techsith",
    "techworld with nana", "teddy smith", "thatmaththing",
    "the cfs channel", "the cherno", "the coding capacitor",
    "the efficient engineer", "the engineering mindset", "the explorer",
    "the krusty lab", "the llm show", "the math sorcerer",
    "the net ninja", "the organic chemistry tutor", "the world of science",
    "thenewboston", "theoperatorlab", "thetestingacademy hindi",
    "thomas simonini", "thoughts for your ram", "tikle's academy of maths",
    "tmp chem", "tom rocks maths", "transcended study hub",
    "traversy media", "troy amelotte", "tubingen machine learning",
    "tutorialspoint", "twit tech podcast network", "tyler ai",
    "uamath115", "uc berkeley", "udacity",
    "uday", "umar jamil", "university of michigan", "university of oxford",
    "untangle, inc.", "valerio velardo - the sound of ai", "veritasium",
    "virtual forge an onapsis company", "virtue physics classes", "vyom hans",
    "web dev simplified", "wessam mesbah", "weights & biases", "wandb", "will fix on prod",
    "william fiset", "william hoff", "williamfiset",
    "wolfsound", "world of quantum", "wrath of math",
    "xander gouws", "xraymancs", "xylyxylyx",
    "yale courses", "yalecourses", "yannic kilcher",
    "yoairfresh", "zeiss arivis", "zewail city opencourseware",
    "zohaib hasan", "zoya (aspiring physicist)", "özhan özatay",
    "the ai epiphany", "aleksa gordić - the ai epiphany",
    "deeplearning.ai", "trelis research",
    "ai engineer", "ai engineer foundation", "ai engineer summit",
    "stanford cs25", "stanford cs336",
    "sky computing", "uc berkeley sky computing", "lmsys", "lmsys org",
    "anyscale", "ray", "mlsys", "mlsys conference", "scale ai",
    "sebastian raschka", "175b", "chris hayduk", "cohere",
    "tri dao", "tim dettmers",
    # Elite Software, Programming Language & Computer Science Educators (>95% Developer Population)
    "bro code", "keith galli", "telusko", "freecodecamp",
    "freecodecamp.org", "corey schafer", "programming with mosh",
    "tech with tim", "traversy media", "the net ninja", "cs dojo",
    "john philip jones", "sentdex", "derek banas", "arjan codes", "arjancodes",
    "michaël gallego", "calm code", "calmcode", "anthony writes code",
    "codebasics", "codewithharry", "gate smashers", "patrick loeber",
    "python engineer", "aladdin persson", "daniel bourke", "mrdbourke",
    # Rust & Systems Programming
    "let's get rusty", "lets get rusty", "fasterthanlime", "jon gjengset", "tim clicks",
    "chris biscardi", "bogdan flaviu", "logan smith", "decoding rust", "rust foundation",
    "the rustacean station", "ryan levick", "no boilerplates",
    # Go (Golang)
    "anthony gg", "anthonygg", "melkey", "alex edwards", "packagemain", "junmin lee",
    "go class by matt holiday", "matt holiday", "inanc gumus", "golang dojo",
    # C & C++
    "the cherno", "cherno", "javidx9", "onelonecoder", "coffee before arch", "lefticus",
    "jason turner - c++ weekly", "c++ weekly", "cppcon", "meeting cpp", "codevault",
    "low level learning", "lowlevellearning", "bisqwit", "creel", "cplusplusguy",
    "cppnuts", "gary explains", "aleksandar haber phd",
    # Quantitative Finance, Mathematical Finance & Financial Engineering
    "luigi ballabio", "quant next", "quantpie", "patrick boyle", "baruch college",
    "bionic turtle", "mit sloan", "columbia business school",
    # C# & .NET
    "nick chapsas", "tim corey", "iamtimcorey", "claudio bernasconi", "raw coding",
    "kavindu gayan", "les jackson", "julio casagrande", "code opinion", "dotnet",
    "microsoft developer", "dometrain",
    # Java & Spring / JVM
    "marcus biel", "java brains", "defog tech", "dan vega", "laurentiu spilca",
    "amigoscode", "in28minutes", "in28minutes - java & cloud", "marco codes", "marcocodes",
    "springdeveloper", "spring framework", "alireza feyz", "thorben janssen",
    # Kotlin & Android
    "philipp lackner", "steve d", "codingwithmitch", "android developers", "kotlin by jetbrains",
    "sebastian aigner", "alexey tsvetkov",
    # Swift, iOS & macOS
    "sean allen", "kavsoft", "vincent pradeilles", "hacking with swift", "paul hudson",
    "rebeloper", "azamsharp", "tundsdev", "stewart lynch", "swiftful thinking",
    # TypeScript, JavaScript & Web Platforms
    "matt pocock", "total typescript", "jack herrington", "web dev simplified", "fireship",
    "kevin powell", "leigh halliday", "theo - t3.gg", "t3 dot gg", "kent c. dodds",
    "syntax", "ben awad", "dave gray", "pedrotech", "cosden solutions",
    # PHP & Modern Laravel
    "laracasts", "jeffrey way", "stitcher.io", "brent roose", "coder's tape", "povilas korop",
    "laravel daily", "aarondfrancis", "freek van der herten", "mateus guimarães",
    # Ruby & Ruby on Rails
    "drifting ruby", "gorails", "chris oliver", "supe rails", "deanin", "thoughtbot",
    "david heinemeier hansson", "driftingruby",
    # SQL, Databases & Data Engineering
    "alex the analyst", "luke barousse", "seattle data guy", "chandoo", "kahan data solutions",
    "cmu database group", "hussein nasser", "stratascratch", "wiseowl tutorials",
    # Shell, Bash, Linux & DevOps
    "learn linux tv", "networkchuck", "jeff geerling", "christian lempa", "levelupns",
    "the linux experiment", "tutoriaLinux", "edureka!", "simplilearn",
    # Elixir, Erlang & Functional Programming
    "elixir casts", "elixircasts", "pragmatic studio", "tsoding daily", "tsoding",
    # Dart & Flutter
    "flutter", "flutterly", "robert brunhage", "vandad nahavandipoor", "heyflutter",
    # R & Julia
    "david robinson", "julia language", "the julia programming language", "statquest with josh starmer",
    # Assembly & Hardware / Low Level Architecture
    "ben eater", "retro game mechanics explained", "rootkit", "liveoverflow", "stack smashing",
    # World-Class Scientists, Researchers & Professors (Physics, Quantum, ML/AI, Theoretical CS)
    "subir sachdev", "sachdevsyk", "david tong", "frederic schuller",
    "tobias osborne", "qiskit", "michael nielsen", "scott aaronson",
    "ilya sutskever", "andrej karpathy", "richard feynman", "feynman",
    "yoshua bengio", "yann lecun", "andrew ng", "geoffrey hinton",
    "pieter abbeel", "sergey levine", "pascal poupart", "shai shalev-shwartz",
    "alexander amini", "tim roughgarden", "erik demaine", "srinivas devadas",
    "ryan o'donnell", "gilbert strang", "john preskill", "quantum computing report",
    "alán aspuru-guzik", "ted sidiropoulos", "simons institute for the theory of computing",
    "maziar raissi", "machine learning street talk", "machine learning street talk (mlst)",
    "nathan kutz", "data-driven science and engineering", "institute for pure & applied mathematics (ipam)",
    "institute for pure and applied mathematics", "stanford mlsys", "zongyi li",
    "physics-informed machine learning",
    # Top-tier Robotics, ROS, and Control Systems Educators (Strictly Academic/Educational)
    "the construct", "articulated robotics", "robotics back-end", "peter corke",
    "cyrill stachniss", "matlab", "mathworks", "brian douglas",
    # Renowned World Language & Linguistics Educators (Covering >95% global speaking population)
    # Arabic
    "arabicpod101.com", "learn arabic with arabicpod101.com", "arabic 101", "the arabic coach", 
    "arabic with amina", "easy arabic", "arabic for english speakers", "learn arabic with khasu",
    "learn arabic with asmae", "arabic khatawaat", "arabic avenue", "arabic4nons", "brian wiles",
    "arabic learners online", "daily life arabic", "learn with safaa", "talk in arabic", "madinah arabic",
    # Spanish
    "spanishpod101.com", "butterfly spanish", "dreaming spanish", "why not spanish?", "the spanish dude",
    "spanish dude", "easy spanish", "spanish after 40", "spanish obsessed", "maria español", "spanishland school",
    "holaspanish", "agustina dreaming spanish", "tu escuela de español", "the language tutor - spanish", "the language tutor",
    "speak spanish faster", "senor jordan", "señor jordan", "spanish with vicente", "bilingüe blogs",
    # Mandarin Chinese
    "chineseclass101.com", "mandarin corner", "yoyo chinese", "shuo shuo chinese", "everyday chinese",
    "grace mandarin chinese", "chinese zero to hero", "learn chinese with emma", "slow & clear chinese",
    "shuoshuo chinese", "comprehensible mandarin", "mandarin companion",
    # Hindi
    "hindipod101.com", "learn hindi with hindipod101.com", "namaste hindi", "anil mahato",
    "learn hindi through english", "easy hindi", "hindilanguage", "pebbles live hindi",
    # Bengali
    "bengalipod101.com", "learn bengali with bengalipod101.com", "bengali language lessons", "easy bengali",
    "bengali tutor", "learn bengali through english",
    # Portuguese
    "portuguesepod101.com", "street smart brazil", "portuguese with leo", "speaking brazilian language school",
    "practice portuguese", "portuguese lab", "easy portuguese", "portuguese with carla", "philipe brazuca",
    # Russian
    "russianpod101.com", "real russian club", "be fluent in russian", "russian with max", "easy russian",
    "boost your russian", "russian progress", "fedya russian", "amazing russian",
    # Japanese
    "japanesepod101.com", "cure dolly", "miku real japanese", "japanese ammo with misa", "game gengo",
    "tokini andy", "nihongo no mori", "easy japanese", "dogen", "japanese pod 101", "comprehensible japanese",
    # German
    "germanpod101.com", "easy german", "learn german with anja", "lingoni german", "deutsch für euch",
    "natürlich german", "yourgermanteacher", "deutsch lernen mit der dw", "get germanized",
    # Korean
    "koreanclass101.com", "talk to me in korean", "go! billy korean", "sweetandtasty tv", "prof. yoon's korean language class",
    "comprehensible korean", "korean unnie", "seemile korean", "learn korean with koreanclass101.com",
    # French
    "frenchpod101.com", "learn french with alexa", "easy french", "piece of french", "innerfrench",
    "francais avec pierre", "comme une française", "french mornings with elisa", "maprofdefrancais",
    # Vietnamese
    "vietnamesepod101.com", "learn vietnamese with annie", "tieng viet oi", "easy vietnamese", "southern vietnamese",
    "vietnamese with jessica", "svff - southern vietnamese for foreigners",
    # Italian
    "italianpod101.com", "learn italian with lucrezia", "easy italian", "italiano automatico", "podcast italiano",
    "learn amo italiano", "passione italiana", "italiano bello",
    # Turkish
    "turkishclass101.com", "easy turkish", "learn turkish with turkishclass101.com", "turkishle",
    "ali yilmaz turkish", "turkish tea time", "learn turkish with burhan",
    # Persian / Farsi
    "persianpod101.com", "chai and conversation", "learn persian with farsi pod 101", "persian language online",
    "easy persian", "farsi wizard", "farsi veritas",
    # Urdu
    "urdupod101.com", "learn urdu with urdupod101.com", "learn urdu with zeeshan", "easy urdu",
    # Dutch
    "dutchpod101.com", "bart de pau", "learndutch.org", "easy dutch", "dutchies to be - learn dutch with kim",
    # Tagalog / Filipino
    "filipinopod101.com", "learn tagalog with filipinopod101.com", "tagalog lite", "talk tagalog", "easy tagalog",
    # Swahili
    "swahilipod101.com", "learn swahili with swahilipod101.com", "swahili kingdom", "easy swahili",
    # Polish, Greek, Swedish, Czech, Indonesian
    "polishpod101.com", "easy polish", "learn polish with polishpod101.com",
    "greekpod101.com", "easy greek", "swedishpod101.com", "easy swedish",
    "indonesianpod101.com", "easy indonesian",
    # Tamil, Telugu, Punjabi, Marathi
    "tamilpod101.com", "learn tamil with pebbles", "learn telugu with pebbles", "learn punjabi with punjabipod101",
    # Premier Linguistics & Polyglot Foundations
    "langfocus", "linguriosa", "nativlang", "tom scott", "lingthusiasm", "the linguaverse", "ecolinguist"
])

OFFICIAL_KEYWORDS = [
    "mit", "stanford", "harvard", "nptel", "courseware", "university", 
    "oxford", "yale", "cambridge", "berkeley", 
    "cmu", "carnegie", "caltech", "princeton", "cornell", "georgia tech",
    "nasa", "cern", "jpl", "esa", "polytechnic", "purdue", "michigan", 
    "eth zurich", "ocw", "ucla", "imperial", "waterloo", "ieee", "acm", 
    "nsf", "darpa", "national lab", "department of", "perimeter institute", "ictp",
    "indian institute of technology", "iit", "iiit", "baruch"
]

# Words to ignore when computing title relevance
_STOPWORDS = frozenset([
    "a", "an", "the", "in", "of", "to", "for", "and", "with", "on",
    "is", "how", "what", "by", "from", "using", "vs", "it", "this",
    "that", "are", "be", "or", "not", "your", "you", "all", "do",
    "|", "-", "&", "!", "?", "#",
])


def parse_iso8601_duration(duration: str) -> int:
    """
    Parse ISO 8601 duration string (e.g., PT15M33S) into total seconds.
    """
    pattern = re.compile(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?')
    match = pattern.match(duration)
    if not match:
        return 0
    
    hours = int(match.group(1)) if match.group(1) else 0
    minutes = int(match.group(2)) if match.group(2) else 0
    seconds = int(match.group(3)) if match.group(3) else 0
    
    return hours * 3600 + minutes * 60 + seconds


def _extract_keywords(text: str) -> set:
    """Extract meaningful lowercase keywords from text, stripping stopwords."""
    words = re.findall(r'[a-z0-9+#.]+', text.lower())
    return {w for w in words if w not in _STOPWORDS and len(w) > 1}


def _compute_title_relevance(topic_title: str, video_title: str, video_description: str = "", search_query: str = "") -> float:
    """Compute keyword overlap ratio between the topic and video title + description in a fully domain-agnostic manner."""
    topic_words = _extract_keywords(topic_title)
    if not topic_words:
        return 0.0

    video_words = _extract_keywords(video_title)
    if not video_words:
        return 0.0

    description_words = _extract_keywords(video_description)

    title_overlap = len(topic_words & video_words)
    desc_overlap = len(topic_words & description_words)

    forward_ratio = title_overlap / len(topic_words)
    reverse_ratio = title_overlap / len(video_words)

    import math
    if forward_ratio > 0 and reverse_ratio > 0:
        bidirectional_score = math.sqrt(forward_ratio * reverse_ratio)
    else:
        bidirectional_score = 0.0

    # Description can boost an existing title match
    desc_ratio = (desc_overlap / len(topic_words)) if topic_words else 0.0
    if bidirectional_score > 0 and desc_ratio > 0:
        desc_boost = desc_ratio * 0.25
        base_relevance = min(1.0, bidirectional_score + desc_boost)
    else:
        base_relevance = bidirectional_score

    return base_relevance


BANNED_CHANNELS = frozenset([
    "pbs space time", "pbs spacetime",
    "codelucky", "craft and code club", "craft & code club", "craft and code", "craft & code",
    "techpapers", "tech papers",
    "dadhichi", "dadhichi institute", "dadhichi institute of technology and management",
    "bytemonk", "byte monk",
    "coding with john", "amigoscode", "java techie", "forrest knight", "forrestknight"
])

CROSS_LANG_MAP = {
    "python": [
        r"(?:\bc\+\+|\bcpp\b|\bc#|\bcsharp\b|\bgolang\b|\brust\b|\bjavascript\b|\btypescript\b|\bjs\b|\bts\b|\bjava\b|\bphp\b|\bruby\b|\bswift\b|\bkotlin\b)",
        r"(?:var, let, and const|var let const|var\b.*?\blet\b.*?\bconst\b)"
    ],
    "javascript": [r"(?:\bpython\b|\bc\+\+|\bcpp\b|\bc#|\bcsharp\b|\bgolang\b|\brust\b|\bjava\b|\bphp\b|\bruby\b|\bswift\b|\bkotlin\b)"],
    "typescript": [r"(?:\bpython\b|\bc\+\+|\bcpp\b|\bc#|\bcsharp\b|\bgolang\b|\brust\b|\bjava\b|\bphp\b|\bruby\b|\bswift\b|\bkotlin\b)"],
    "c++": [r"(?:\bpython\b|\bjavascript\b|\bjs\b|\btypescript\b|\bts\b|\bc#|\bcsharp\b|\bjava\b|\bphp\b|\bruby\b|\bswift\b)"],
    "c#": [r"(?:\bpython\b|\bc\+\+|\bcpp\b|\bjavascript\b|\bjs\b|\btypescript\b|\bts\b|\bjava\b|\bphp\b|\bruby\b|\bswift\b)"],
    "java": [r"(?:\bpython\b|\bc\+\+|\bcpp\b|\bc#|\bcsharp\b|\bjavascript\b|\bjs\b|\btypescript\b|\bts\b|\bphp\b|\bruby\b|\bswift\b)"],
    "rust": [r"(?:\bpython\b|\bc\+\+|\bcpp\b|\bc#|\bcsharp\b|\bjavascript\b|\bjs\b|\bjava\b|\bphp\b|\bruby\b)"],
    "golang": [r"(?:\bpython\b|\bc\+\+|\bcpp\b|\bc#|\bcsharp\b|\bjavascript\b|\bjs\b|\bjava\b|\bphp\b|\bruby\b)"],
}

def _is_cross_language_conflict(subject_context: str, text: str) -> bool:
    """Return True if video text advertises a competing programming language/syntax or conflicting domain."""
    if not subject_context or not text:
        return False
    subj_lower = subject_context.lower()
    text_lower = text.lower()
    
    # Language subject gate: if learning a human language, reject math/geometry/science videos
    human_langs = [
        "arabic", "spanish", "french", "german", "mandarin", "chinese", "japanese", "korean", "italian", "russian",
        "hindi", "bengali", "portuguese", "vietnamese", "turkish", "persian", "farsi", "urdu", "dutch", "tagalog",
        "filipino", "swahili", "polish", "greek", "swedish", "indonesian", "tamil", "telugu", "punjabi", "marathi"
    ]
    if any(hl in subj_lower for hl in human_langs):
        if any(term in text_lower for term in ["arithmetic", "hindu-arabic", "geometry", "calculus", "linear algebra", "discrete math"]):
            return True

    for lang, patterns in CROSS_LANG_MAP.items():
        if re.search(rf"\b{re.escape(lang)}\b", subj_lower):
            for pattern in patterns:
                if re.search(pattern, text_lower, re.IGNORECASE):
                    return True
    return False


def _score_video(
    video: dict, 
    topic_title: str, 
    search_query: str = "", 
    preferred_channel: str = "",
    subject_context: str = ""
) -> float:
    """
    Score a YouTube video for educational relevance in a domain-agnostic way.
    Returns -1.0 if the video should be excluded (duration or relevance gate).
    """
    duration_seconds = parse_iso8601_duration(video.get("contentDetails", {}).get("duration", ""))

    # Duration gate per AGENTS.md: Videos MUST be between 8 and 120 minutes in length (480s to 7200s)
    if duration_seconds < 480 or duration_seconds > 7200:
        return -1.0

    snippet = video.get("snippet", {})
    channel_name = snippet.get("channelTitle", "").lower()
    video_title = snippet.get("title", "")

    # Hard ban gate: strictly reject banned creators
    if any(b in channel_name for b in BANNED_CHANNELS):
        return -1.0

    # Spoken language gate: reject videos explicitly targeting non-English speakers
    # (unless the search query explicitly asks for it)
    non_english_keywords = ["in hindi", "in telugu", "in tamil", "in malayalam", "in urdu", "in bangla", "in bengali", "in marathi", "in kannada", "in gujarati"]
    title_lower = video_title.lower()
    if any(k in title_lower for k in non_english_keywords) and not any(k in search_query.lower() for k in non_english_keywords):
        return -1.0
    if re.search(r'[\u0900-\u0D7F]', video_title) and not re.search(r'[\u0900-\u0D7F]', search_query):
        return -1.0

    # Cross-language / domain conflict gate: strictly reject wrong-language videos (e.g. C++ or JS for Python)
    if _is_cross_language_conflict(subject_context, video_title):
        return -1.0

    title_relevance = _compute_title_relevance(
        topic_title, 
        video_title, 
        snippet.get("description", ""), 
        search_query
    )

    is_trusted = channel_name in TRUSTED_CHANNELS or any(kw in channel_name for kw in OFFICIAL_KEYWORDS)

    # Relevance gate:
    # For trusted channels: require at least 15% overlap so lecture series (e.g. "CS50 Lecture 3") can match.
    # For non-trusted channels: require at least 35% overlap to block clickbait and unrelated re-uploads.
    min_relevance = 0.15 if is_trusted else 0.35
    if title_relevance < min_relevance:
        return -1.0

    # Hard gate: only accept videos from trusted educational channels.
    # A relevant video from a random channel is worth less than no video at all.
    if not is_trusted:
        return -1.0

    view_count = int(video.get("statistics", {}).get("viewCount", "0"))

    # Composite score (trusted channel is a prerequisite, not a bonus)
    relevance_score = title_relevance * 70                             # max 70
    duration_score = min(duration_seconds / 3600, 1.0) * 15            # max 15
    view_score = min(math.log10(max(view_count, 1)) / 7, 1.0) * 10    # max 10
    affinity_score = 15 if preferred_channel and channel_name == preferred_channel.lower() else 0

    # Subject reinforcement bonus: if video explicitly names the primary subject in title
    if subject_context and subject_context.lower() in video_title.lower():
        affinity_score += 10

    return relevance_score + duration_score + view_score + affinity_score


async def search_youtube_videos(
    query: str,
    max_results: int = 1,
    topic_title: str = "",
    strict_official_sources: bool = False,
    subject_context: str = "",
    preferred_channel: str = "",
    exclude_video_ids: Optional[Set[str]] = None
) -> List[Dict[str, str]]:
    """
    Search YouTube and return the best matching educational videos.
    First checks the curated database using pgvector semantic search (Gemini embeddings).
    If no rigorous match is found (>0.78 cosine similarity), falls back to dynamic YouTube API search.
    """
    from app.core.supabase_client import get_supabase_client
    import json
    
    # Use the detailed search query for the vector search as it is highly discriminative.
    # Fallback to topic_title or subject_context if query is missing.
    search_target = query or topic_title or subject_context

    if search_target and settings.GEMINI_API_KEY:
        try:
            # Generate Gemini embedding for semantic search
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "model": "models/gemini-embedding-2",
                "outputDimensionality": 768,
                "content": {"parts": [{"text": search_target}]}
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    embedding_vector = res.json().get('embedding', {}).get('values')
                    
                    if embedding_vector:
                        sb = get_supabase_client()
                        rpc_response = sb.rpc(
                            "match_curated_videos",
                            {
                                "query_embedding": embedding_vector,
                                "match_threshold": 0.82,
                                "match_count": max(max_results * 4, 10)
                            }
                        ).execute()
                        
                        matches = rpc_response.data
                        if matches:
                            # Filter out already used video IDs, wrong-language conflicts, enforce 8-120 min duration,
                            # and require minimum title relevance to prevent unrelated curated matches
                            filtered_matches = []
                            for m in matches:
                                if exclude_video_ids and m["video_id"] in exclude_video_ids:
                                    continue
                                if _is_cross_language_conflict(subject_context, m.get("clean_title", "")):
                                    continue
                                if not (8 <= m.get("duration_mins", 0) <= 120):
                                    continue
                                # Verify title relevance if topic_title or query is present
                                if topic_title:
                                    t_rel = _compute_title_relevance(topic_title, m.get("clean_title", ""), search_query=search_target)
                                    if t_rel < 0.15:
                                        continue
                                filtered_matches.append(m)
                            if filtered_matches:
                                logger.info(f"Supabase pgvector match! '{search_target}' -> '{filtered_matches[0]['topic']}' ({filtered_matches[0]['similarity']:.2f})")
                                return [
                                    {
                                        "video_id": m["video_id"],
                                        "video_title": m["clean_title"],
                                        "channel_name": m["channel"],
                                        "duration_minutes": m["duration_mins"]
                                    } for m in filtered_matches[:max_results]
                                ]
                            else:
                                logger.info(f"All {len(matches)} curated matches for '{search_target}' were excluded by filters/usage. Falling back to dynamic search.")
                        else:
                            logger.info(f"No curated match >= 0.88 for '{search_target}'. Falling back to dynamic YouTube search.")
        except Exception as e:
            logger.error(f"Semantic search failed for '{search_target}', falling back to YouTube: {e}")

    # --- 2. THE DYNAMIC FALLBACK ENGINE (OLD SYSTEM) ---
    if not settings.YOUTUBE_API_KEY:
        logger.warning("YOUTUBE_API_KEY not set, skipping YouTube search.")
        return []

    async def execute_search(search_q: str) -> List[Dict[str, str]]:
        import urllib.parse
        strict_search_q = f"{search_q} -telugu -hindi -tamil -marketing"
        video_ids = []

        # 1. Try official YouTube Search API if available
        if settings.YOUTUBE_API_KEY:
            try:
                search_url = "https://www.googleapis.com/youtube/v3/search"
                search_params = {
                    "part": "snippet",
                    "q": strict_search_q,
                    "type": "video",
                    "maxResults": 25 if strict_official_sources else 15,
                    "key": settings.YOUTUBE_API_KEY,
                    "videoEmbeddable": "true",
                    "relevanceLanguage": "en",
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    search_response = await client.get(search_url, params=search_params)
                    if search_response.status_code == 200:
                        search_data = search_response.json()
                        video_ids = [item["id"]["videoId"] for item in search_data.get("items", [])]
            except Exception as e:
                logger.warning(f"YouTube Search API call failed ({e}), falling back to HTML scraper...")

        # 2. Fallback to quota-free HTML search scraping if API failed or 429'd
        if not video_ids:
            try:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
                scrape_url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(strict_search_q)}"
                async with httpx.AsyncClient(timeout=10.0) as client:
                    r = await client.get(scrape_url, headers=headers)
                    if r.status_code == 200:
                        video_ids = list(dict.fromkeys(re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', r.text)))[:15]
            except Exception as e:
                logger.error(f"HTML scraper fallback failed for '{strict_search_q}': {e}")

        if not video_ids:
            return []

        # 3. Bulk fetch metadata via /videos?id= (costs only 1 quota unit, practically unlimited)
        try:
            videos_url = "https://www.googleapis.com/youtube/v3/videos"
            videos_params = {
                "part": "contentDetails,snippet,statistics",
                "id": ",".join(video_ids[:20]),
                "key": settings.YOUTUBE_API_KEY,
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                videos_response = await client.get(videos_url, params=videos_params)
                videos_response.raise_for_status()
                return videos_response.json().get("items", [])
        except Exception as e:
            logger.error(f"Failed to fetch video details for IDs: {e}")
            return []

    def filter_and_score(items: list, require_official: bool, use_scoring: bool):
        valid = []
        for item in items:
            if exclude_video_ids and item.get("id") in exclude_video_ids:
                continue

            snippet = item.get("snippet", {})
            channel_name_lower = snippet.get("channelTitle", "").lower()

            if require_official and not any(kw in channel_name_lower for kw in OFFICIAL_KEYWORDS):
                continue

            if use_scoring:
                score = _score_video(item, topic_title, query, preferred_channel, subject_context=subject_context)
                if score >= 0:
                    valid.append((score, item))
            else:
                duration_seconds = parse_iso8601_duration(item.get("contentDetails", {}).get("duration", ""))
                video_title = snippet.get("title", "")
                if 480 <= duration_seconds <= 3600 and not _is_cross_language_conflict(subject_context, video_title):
                    valid.append((0, item))
        return valid

    try:
        use_scoring = bool(topic_title.strip())
        items = await execute_search(query)
        candidates = filter_and_score(items, strict_official_sources, use_scoring)

        if not candidates and strict_official_sources:
            candidates = filter_and_score(items, False, use_scoring)

        # Multi-tier fallback queries if initial specific query produced 0 valid candidates
        if not candidates and topic_title:
            subject_prefix = f"{subject_context} " if subject_context else ""
            # Detect language/humanities subject context
            is_lang_subj = any(l in (subject_context + " " + topic_title).lower() for l in [
                "arabic", "spanish", "french", "german", "mandarin", "chinese", "japanese", "korean", "italian", "russian",
                "hindi", "bengali", "portuguese", "vietnamese", "turkish", "persian", "farsi", "urdu", "dutch", "tagalog",
                "filipino", "swahili", "polish", "greek", "swedish", "indonesian", "tamil", "telugu", "punjabi", "marathi",
                "language", "speaking", "pronunciation", "grammar", "vocabulary", "alphabets", "kanji", "hangul", "hiragana"
            ])
            if is_lang_subj:
                fallback_list = [
                    f"{subject_prefix}{topic_title} lesson",
                    f"{subject_prefix}{topic_title} conversation",
                    f"{subject_prefix}{topic_title} for beginners",
                    f"{subject_prefix}{topic_title}",
                    f"{subject_prefix}{topic_title} full course"
                ]
            else:
                fallback_list = [
                    f"{subject_prefix}{topic_title} tutorial",
                    f"{subject_prefix}{topic_title}",
                    f"{subject_prefix}{topic_title} Mosh",
                    f"{subject_prefix}{topic_title} Corey Schafer",
                    f"{subject_prefix}{topic_title} FreeCodeCamp",
                    f"{subject_prefix}{topic_title} lecture"
                ]
            for fallback_q in fallback_list:
                logger.info(f"Retrying YouTube search for '{topic_title}' with fallback: '{fallback_q}'")
                items = await execute_search(fallback_q)
                candidates = filter_and_score(items, False, use_scoring)
                if candidates:
                    break

        if not candidates:
            logger.info(f"No relevant matches found for '{query}' against topic '{topic_title}'. Defaulting to Reference Cards.")
            return []

        # Sort candidates by score descending
        candidates.sort(key=lambda x: x[0], reverse=True)

        results = []
        for score, item in candidates[:max_results]:
            results.append({
                "video_id": item["id"],
                "video_title": item.get("snippet", {}).get("title", ""),
                "channel_name": item.get("snippet", {}).get("channelTitle", ""),
                "duration_minutes": parse_iso8601_duration(item.get("contentDetails", {}).get("duration", "")) // 60,
            })

        if results and use_scoring:
            best_score = candidates[0][0]
            logger.info(f"YouTube: Best match for '{topic_title}' -> '{results[0]['video_title']}' (score: {best_score:.1f})")

        return results

    except Exception as e:
        logger.error(f"YouTube search/filter failed for query '{query}': {e}")
        return []

async def find_module_playlist(module_title: str) -> List[Dict]:
    """
    Search YouTube for a playlist matching the module title, fetch its videos,
    and return them with full details (duration, stats, etc.).
    
    Returns a list of video dicts with keys: video_id, video_title, channel_name,
    duration_minutes, or an empty list if no suitable playlist found.
    """
    if not settings.YOUTUBE_API_KEY:
        return []

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Step 1: Search for playlists matching the module title
            search_url = "https://www.googleapis.com/youtube/v3/search"
            import re
            clean_module_title = re.sub(r'^(?:Week|Module|Section)\s*\d+:\s*', '', module_title, flags=re.IGNORECASE)

            search_params = {
                "part": "snippet",
                "q": f"{clean_module_title} full course tutorial -telugu -hindi -tamil -marketing",
                "type": "playlist",
                "maxResults": 15,
                "key": settings.YOUTUBE_API_KEY,
                "relevanceLanguage": "en",
            }
            search_response = await client.get(search_url, params=search_params)
            search_response.raise_for_status()
            playlists = search_response.json().get("items", [])

            if not playlists:
                logger.info(f"No playlists found for module '{module_title}'")
                return []

            # Step 1.5: The God-Tier Enforcer (Prioritize Trusted Channels)
            def _is_trusted(p: Dict) -> bool:
                channel_name = p.get("snippet", {}).get("channelTitle", "").lower()
                return channel_name in TRUSTED_CHANNELS
                
            playlists.sort(key=lambda p: 0 if _is_trusted(p) else 1)

            # Step 2: Try each playlist until we find one with enough videos
            bad_keywords = ["telugu", "hindi", "tamil", "kannada", "malayalam", "bengali", "marathi"]
            for playlist_item in playlists:
                playlist_id = playlist_item["id"]["playlistId"]
                playlist_title = playlist_item["snippet"]["title"]
                channel_name = playlist_item["snippet"]["channelTitle"]

                title_lower = playlist_title.lower()
                channel_lower = channel_name.lower()
                if any(bad in title_lower or bad in channel_lower for bad in bad_keywords):
                    continue
                    
                mod_words = set(re.findall(r'\w+', clean_module_title.lower()))
                mod_words = {w for w in mod_words if len(w) > 3} # ignore small words
                pl_words = set(re.findall(r'\w+', title_lower))
                
                if not _is_trusted(playlist_item) and mod_words and len(mod_words.intersection(pl_words)) == 0:
                    logger.debug(f"Skipping playlist '{playlist_title}' due to no keyword overlap with '{clean_module_title}'")
                    continue

                # Fetch playlist items (up to 50)
                items_url = "https://www.googleapis.com/youtube/v3/playlistItems"
                items_params = {
                    "part": "snippet",
                    "playlistId": playlist_id,
                    "maxResults": 50,
                    "key": settings.YOUTUBE_API_KEY,
                }
                items_response = await client.get(items_url, params=items_params)
                items_response.raise_for_status()
                playlist_videos = items_response.json().get("items", [])

                if len(playlist_videos) < 3:
                    continue  # Too few videos, try next playlist

                # Step 3: Get full video details (duration, stats)
                video_ids = []
                for pv in playlist_videos:
                    vid_id = pv.get("snippet", {}).get("resourceId", {}).get("videoId")
                    if vid_id:
                        video_ids.append(vid_id)

                if not video_ids:
                    continue

                videos_url = "https://www.googleapis.com/youtube/v3/videos"
                videos_params = {
                    "part": "contentDetails,snippet,statistics",
                    "id": ",".join(video_ids[:50]),
                    "key": settings.YOUTUBE_API_KEY,
                }
                videos_response = await client.get(videos_url, params=videos_params)
                videos_response.raise_for_status()
                video_details = videos_response.json().get("items", [])

                # Build the catalog of playlist videos
                catalog = []
                for vd in video_details:
                    duration_seconds = parse_iso8601_duration(
                        vd.get("contentDetails", {}).get("duration", "")
                    )
                    # Accept videos 3-90 minutes for playlists (wider range since
                    # playlist videos can be shorter individual lectures)
                    if duration_seconds < 180 or duration_seconds > 5400:
                        continue
                    catalog.append({
                        "video_id": vd["id"],
                        "video_title": vd.get("snippet", {}).get("title", ""),
                        "channel_name": vd.get("snippet", {}).get("channelTitle", channel_name),
                        "duration_minutes": duration_seconds // 60,
                        "description": vd.get("snippet", {}).get("description", ""),
                    })

                if len(catalog) >= 3:
                    logger.info(
                        f"Found playlist for '{module_title}': '{playlist_title}' "
                        f"by {channel_name} ({len(catalog)} usable videos)"
                    )
                    try:
                        titles = [v["video_title"] for v in catalog]
                        embeddings = await generate_embeddings(titles)
                        for i, v in enumerate(catalog):
                            v["embedding"] = embeddings[i]
                    except Exception as e:
                        logger.error(f"Failed to generate embeddings for playlist: {e}")
                    
                    return catalog

            logger.info(f"No suitable playlist found for module '{module_title}' (all had <3 usable videos)")
            return []

    except Exception as e:
        logger.error(f"Playlist search failed for '{module_title}': {e}")
        return []


async def match_playlist_video_to_topic(
    catalog: List[Dict], topic_title: str
) -> Dict | None:
    """
    Find the best matching video from a playlist catalog using a Hybrid approach:
    1. Keyword Overlap Heuristic (Fast & precise)
    2. Semantic Matching via Cohere (Fuzzy fallback)
    """
    if not catalog:
        return None
        
    # --- 1. KEYWORD HEURISTIC ---
    best_keyword_score = 0.0
    best_keyword_video = None
    
    for video in catalog:
        relevance = _compute_title_relevance(
            topic_title,
            video["video_title"],
            video.get("description", ""),
        )
        if relevance > best_keyword_score:
            best_keyword_score = relevance
            best_keyword_video = video
            
    # If we have a solid keyword match, accept it instantly without semantic embedding
    if best_keyword_score >= 0.25 and best_keyword_video:
        return best_keyword_video

    # --- 2. SEMANTIC FALLBACK ---
    has_embeddings = all(vid.get("embedding") is not None for vid in catalog)
    if not has_embeddings:
        return None

    try:
        topic_embeddings = await generate_embeddings([topic_title])
        topic_vec = topic_embeddings[0]
    except Exception as e:
        logger.error(f"Failed to embed topic '{topic_title}': {e}")
        return None

    best_semantic_score = 0.0
    best_semantic_video = None

    for video in catalog:
        score = cosine_similarity(topic_vec, video["embedding"])
        if score > best_semantic_score:
            best_semantic_score = score
            best_semantic_video = video

    # Semantic threshold strictly tuned for Cohere to avoid fuzzy false-positives
    if best_semantic_score >= 0.55 and best_semantic_video:
        return best_semantic_video
        
    return None
