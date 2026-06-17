import { useEffect, useRef, Fragment } from 'react'
import ColorBends from '../components/ColorBends'
import Aurora from '../components/Aurora'
import LightPillar from '../components/LightPillar'
import SideRays from '../components/SideRays'
import LightRays from '../components/LightRays'
import DarkVeil from '../components/DarkVeil'
import ChallengeAccordion from '../components/ChallengeAccordion'
import {
  damp,
  SMOOTH,
  stagger,
  applyEntrance,
  easeInOutQuint,
  easeInOutCubic,
  easeOutCubic,
  easeOutExpo,
  lerp,
} from '../utils/motion'

// Total scroll track height — lower = less wheel travel, same progress timing
const SCROLL_PAGE_HEIGHT_VH = 800

// Section 1 (hero → brighten → handoff): shorter pre-transition scroll, same fade/brighten spans
const HERO_FADE_START = 0.005
const HERO_FADE_END = 0.04
const BRIGHTEN_END = 0.085
const BG_FADE_START = 0.095
const SECTION2_START = 0.105
const SECTION2A_END = 0.245

const SECTION2B_START = 0.265
const SECTION2B_END = 0.365

const S2_EXIT_BRIGHTEN_START = 0.365
const S2_EXIT_BRIGHTEN_END = 0.445
const S2_EXIT_FADE_START = 0.425
const S2_EXIT_FADE_END = 0.485

const SECTION3_START = 0.445
const SECTION3_END = 0.535

const S3_EXIT_BRIGHTEN_START = 0.535
const S3_EXIT_BRIGHTEN_END = 0.595
const S3_EXIT_FADE_START = 0.575
const S3_EXIT_FADE_END = 0.615

const S3_BRIDGE_START = 0.545
const S3_BRIDGE_PEAK = 0.575
const S3_BRIDGE_END = 0.605

const SECTION4_START = 0.59
const SECTION4_END = 0.68

const S4_EXIT_BRIGHTEN_START = 0.68
const S4_EXIT_BRIGHTEN_END = 0.73
const S4_EXIT_FADE_START = 0.71
const S4_EXIT_FADE_END = 0.75

const SECTION5_START = 0.695
const SECTION5_END = 0.77

const S5_EXIT_BRIGHTEN_START = 0.77
const S5_EXIT_BRIGHTEN_END = 0.80
const S5_EXIT_FADE_START = 0.785
const S5_EXIT_FADE_END = 0.82

const SECTION6_START = 0.785
const SECTION6_END = 1.0

const PART_A_SPLIT_PCT = 48
const PART_B_SPLIT_PCT = 28

const STATS_A = [
  { target: 52, suffix: '%', label: 'of patients prefer independent physicians' },
  { target: 90, suffix: ' days', label: 'to page-one rankings' },
  { target: 1, suffix: '', label: 'partner for IT, marketing & software' },
]

const STATS_B = [
  { target: 97, suffix: '%', label: 'of patients search online before choosing a provider', decimal: 0 },
  { target: 40, suffix: '%', label: 'avg reduction in cost per booked appointment', decimal: 0 },
  { target: 20, suffix: '+hrs', label: 'saved per week through workflow automation', decimal: 0 },
  { target: 4.8, suffix: '★', label: 'avg rating after 6 months with review automation', decimal: 1 },
]

const CHALLENGES = [
  {
    tag: 'DIGITAL VISIBILITY',
    title: "You're not showing up when patients search for you.",
    quote: "We spent $8,000 on a new website and we're still not on the first page of Google. I don't even know what went wrong.",
    attribution: 'Practice Administrator',
    body: "97% of patients search online before choosing a provider. If you're not on page one, you effectively don't exist.",
    stat: '97%',
    statLabel: 'of patients search online before choosing a provider',
  },
  {
    tag: 'REPUTATION',
    title: 'One bad review is hurting your whole practice.',
    quote: 'We have one angry patient who left three bad reviews on three platforms. It\'s the first thing anyone sees.',
    attribution: 'Solo Practice Physician',
    body: "Happy patients don't leave reviews unprompted. Unhappy ones always do. Without automation, you're always losing the ratio battle.",
    stat: '76%',
    statLabel: 'of patients say reviews influence their provider choice',
  },
  {
    tag: 'HIPAA COMPLIANCE',
    title: 'Your website and ads may be violating HIPAA right now.',
    quote: "Our marketing company set up Facebook ads and I found out the pixel was tracking patient health conditions. I didn't know that was illegal.",
    attribution: 'Practice Manager',
    body: 'Most digital agencies have zero HIPAA training. They install standard pixels and forms — all potentially non-compliant.',
    stat: '$1.9M',
    statLabel: 'maximum fine per HIPAA violation category',
  },
  {
    tag: 'PATIENT ACQUISITION',
    title: "You're spending on ads but the wrong patients are calling.",
    quote: "We're spending $5,000/month on Google Ads — half the calls are outside our service area or asking about procedures we don't do.",
    attribution: 'Office Director',
    body: "Without conversion tracking tied to booked appointments, you're optimizing for clicks — not patients walking through the door.",
    stat: '$180',
    statLabel: 'average cost-per-click in competitive healthcare markets',
  },
  {
    tag: 'WEBSITE EXPERIENCE',
    title: 'Patients visit your website and call your competitor.',
    quote: "Our website was built 6 years ago. It takes forever to load on a phone, you can't book online, and it doesn't reflect what we do anymore.",
    attribution: 'Physician Owner',
    body: 'A dated website signals a dated practice. Patients make instant credibility judgments from their first impression.',
    stat: '68%',
    statLabel: 'of patients prefer to book appointments online',
  },
  {
    tag: 'IT INFRASTRUCTURE',
    title: 'Your IT is held together with duct tape and prayers.',
    quote: "Our server went down on a Tuesday and we couldn't access patient records for 4 hours. Nobody knew who to call. We lost half a day.",
    attribution: 'Practice Administrator',
    body: 'Your break-fix IT vendor has no idea what a BAA is, let alone DICOM or HL7 integration requirements.',
    stat: '$9K',
    statLabel: 'average cost of IT downtime per hour in healthcare',
  },
  {
    tag: 'WORKFLOW & AUTOMATION',
    title: 'Your staff is drowning in tasks a computer should handle.',
    quote: "My front desk spends 3 hours a day on appointment reminders and sending follow-up forms manually. I can't afford to hire another person just for that.",
    attribution: 'Practice Owner',
    body: 'Administrative burden is the top driver of healthcare staff turnover. Your best people are leaving over work that should be automated.',
    stat: '16hrs',
    statLabel: 'per week lost to prior authorization alone — per practice',
  },
  {
    tag: 'VENDOR FRAGMENTATION',
    title: 'You manage 8 vendors. None of them talk to each other.',
    quote: 'I have a separate company for my website, SEO, ads, IT, and social. When something breaks, everyone points at someone else.',
    attribution: 'ENT Administrator',
    body: 'Coordinating 6 to 8 vendors is itself a part-time job. Nothing gets decided. Nothing improves fast enough.',
    stat: '6–8',
    statLabel: 'vendors managed by the average independent practice',
  },
  {
    tag: 'SOFTWARE & CRM',
    title: 'Your practice runs on workarounds and spreadsheets.',
    quote: "We use 4 different systems and none of them talk to each other. My staff has a spreadsheet that tracks what falls through the cracks. I'm embarrassed.",
    attribution: 'Physician Owner',
    body: 'Every spreadsheet tracking patient data is an unencrypted PHI risk. Every manual data entry step is a human error waiting to happen.',
    stat: '4+',
    statLabel: 'disconnected systems in the average independent practice',
  },
  {
    tag: 'COMPETITION',
    title: 'Hospital systems are taking your patients. Quietly.',
    quote: "Three years ago we had no competition. Now there's a hospital affiliate 2 miles away with a $2M marketing budget. We can't compete. Or can we?",
    attribution: 'Independent Physician',
    body: '52% of patients prefer independent physicians — but only if they can find you. Technology is the equalizer.',
    stat: '52%',
    statLabel: 'of patients prefer independent physicians — but only if they can find them',
  },
]

const ALLIANCE_COMPARE = {
  left: {
    title: 'WHAT HOSPITAL SYSTEMS HAVE',
    items: [
      {
        label: 'Centralized IT ops',
        desc: '24/7 monitoring, patch management, enterprise security — all invisible to the physician.',
      },
      {
        label: 'AI-powered scheduling',
        desc: 'Predictive no-show models, automated waitlists, real-time capacity optimization.',
      },
      {
        label: 'Dedicated compliance teams',
        desc: 'Entire legal and compliance departments for HIPAA, OCR, and regulatory changes.',
      },
      {
        label: '$2M+ marketing engines',
        desc: 'SEO teams, PPC managers, content studios, and reputation systems running 24/7.',
      },
    ],
  },
  right: {
    title: 'WHAT YOU GET THROUGH ENSEMBLE',
    items: [
      {
        label: 'The same enterprise IT stack',
        desc: 'VLAN-segmented clinical networks, managed endpoints, DICOM, EHR integration — at practice scale.',
      },
      {
        label: 'AI that hospital systems pay $500K/yr for',
        desc: 'Prior auth pre-screening, no-show modeling, workflow automation — deployed in days, not quarters.',
      },
      {
        label: 'Full HIPAA compliance program',
        desc: 'Risk assessments, policy documentation, staff training, incident response — the complete program.',
      },
      {
        label: 'The full marketing engine',
        desc: 'SEO, PPC, reputation, content — coordinated, HIPAA-compliant, measured in booked appointments.',
      },
    ],
  },
}

const ALLIANCE_CARDS = [ALLIANCE_COMPARE.left, ALLIANCE_COMPARE.right]
const ALLIANCE_ITEM_COUNT = ALLIANCE_CARDS.reduce((sum, card) => sum + card.items.length, 0)

const WHO_WE_ARE_PILLARS = [
  {
    title: '100% healthcare exclusive',
    desc: 'We have never worked outside healthcare. Every tool, process, and team member is purpose-built for the regulated world of medical practices.',
  },
  {
    title: 'One team. Zero gaps.',
    desc: 'Software, IT infrastructure, and marketing under one contract — one partner, one point of contact who owns every outcome.',
  },
  {
    title: 'Measured in real results.',
    desc: 'We measure success in patient acquisition and practice revenue growth — not impressions, vanity metrics, or click-through rates.',
  },
  {
    title: 'HIPAA is not a checkbox.',
    desc: 'We hold BAAs with every tool in our stack that touches patient data. 100% BAA coverage. Zero compliance incidents for our clients.',
  },
  {
    title: 'We move in weeks, not quarters.',
    desc: 'Hospital systems take 6–18 months to implement a new tool. We launch new service lines online in 2–4 weeks.',
  },
  {
    title: 'Based in St. Louis.',
    desc: 'We are here — available for in-person meetings, on your schedule. Not an offshore support queue.',
  },
]

const AURORA_COLORS = ['#7cff67', '#B497CF', '#5227FF']

const AUDIT_FEATURES = [
  "I'm invisible online",
  "My reputation and ads aren't working",
  "I'm exposed to HIPAA and IT risk",
  'My staff is buried in manual work',
  'Hospital systems are outcompeting me',
]

const formatCount = (target, suffix, progress, decimal = 0) => {
  const raw = target * progress
  const value = decimal > 0 ? raw.toFixed(decimal) : String(Math.round(raw))
  return `${value}${suffix}`
}

const Landing = () => {
  const transitionRef = useRef(null)
  const colorBendsRef = useRef(null)
  const bgRef = useRef(null)
  const heroTextRef = useRef(null)
  const scrollHintRef = useRef(null)
  const scrollHintTextRef = useRef(null)
  const section2Ref = useRef(null)
  const sideRaysRef = useRef(null)
  const section3Ref = useRef(null)
  const s3LabelRef = useRef(null)
  const s3HeadingRef = useRef(null)
  const s3DescRef = useRef(null)
  const s3AccordionRef = useRef(null)
  const s3ContentRef = useRef(null)
  const s3BrightOverlayRef = useRef(null)
  const s3AccentGlowRef = useRef(null)
  const s3VeilWrapRef = useRef(null)
  const s3BridgeRef = useRef(null)
  const s3BridgeQuoteRef = useRef(null)
  const s3BridgeAttrRef = useRef(null)
  const section4Ref = useRef(null)
  const lightPillarRef = useRef(null)
  const s4PillarWrapRef = useRef(null)
  const s4LabelRef = useRef(null)
  const s4HeadingRef = useRef(null)
  const s4DescRef = useRef(null)
  const s4GridRef = useRef(null)
  const s4CardRefs = useRef(ALLIANCE_CARDS.map(() => null))
  const s4ItemRefs = useRef(Array.from({ length: ALLIANCE_ITEM_COUNT }, () => null))
  const s4ContentRef = useRef(null)
  const s4BrightOverlayRef = useRef(null)
  const s4PillarBrightRef = useRef(null)
  const section5Ref = useRef(null)
  const s5AuroraWrapRef = useRef(null)
  const s5LabelRef = useRef(null)
  const s5HeadingRef = useRef(null)
  const s5DescRef = useRef(null)
  const s5GridRef = useRef(null)
  const s5CardRefs = useRef(WHO_WE_ARE_PILLARS.map(() => null))
  const s5ContentRef = useRef(null)
  const s5BrightOverlayRef = useRef(null)
  const s5AuroraBrightRef = useRef(null)
  const section6Ref = useRef(null)
  const s6RaysWrapRef = useRef(null)
  const s6FormRef = useRef(null)
  const s2PartARef = useRef(null)
  const s2PartAContentRef = useRef(null)
  const s2PartBRef = useRef(null)
  const s2StageRef = useRef(null)
  const s2LabelRef = useRef(null)
  const s2HeadingRef = useRef(null)
  const s2DescRef = useRef(null)
  const s2CtaRef = useRef(null)
  const s2StatsRef = useRef(null)
  const statColRefs = useRef(STATS_A.map(() => null))
  const statNumRefs = useRef(STATS_A.map(() => null))
  const statLabelRefs = useRef(STATS_A.map(() => null))
  const bCardRefs = useRef(STATS_B.map(() => null))
  const bCardNumRefs = useRef(STATS_B.map(() => null))
  const targetProgress = useRef(0)
  const smoothProgress = useRef(0)
  const section2Smooth = useRef(0)
  const panSmooth = useRef(0)
  const alignSmooth = useRef(1)
  const section3Smooth = useRef(0)
  const section4Smooth = useRef(0)
  const section5Smooth = useRef(0)
  const section6Smooth = useRef(0)
  const brightenSmooth = useRef(0)
  const heroFadeSmooth = useRef(0)
  const lightPassSmooth = useRef(0)
  const s2ExitBrightenSmooth = useRef(0)
  const s2ExitFadeSmooth = useRef(0)
  const s3ExitBrightenSmooth = useRef(0)
  const s3ExitFadeSmooth = useRef(0)
  const s4ExitBrightenSmooth = useRef(0)
  const s4ExitFadeSmooth = useRef(0)
  const s5ExitBrightenSmooth = useRef(0)
  const s5ExitFadeSmooth = useRef(0)
  const lastFrame = useRef(0)
  const countAnimA = useRef({ active: false, start: 0, progress: 0 })
  const countAnimB = useRef({ active: false, start: 0, progress: 0 })
  const s3ScrollPrimedRef = useRef(false)
  const s4ScrollPrimedRef = useRef(false)
  const s5ScrollPrimedRef = useRef(false)

  useEffect(() => {
    const bindScrollPassthrough = (ref) => {
      const el = ref.current
      if (!el) return () => {}

      const onWheel = (e) => {
        if (el.scrollHeight <= el.clientHeight + 2) return

        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
        const atTop = el.scrollTop <= 0

        if ((e.deltaY > 0 && atBottom) || (e.deltaY < 0 && atTop)) {
          window.scrollBy(0, e.deltaY)
        }
      }

      el.addEventListener('wheel', onWheel, { passive: true })
      return () => el.removeEventListener('wheel', onWheel)
    }

    const cleanups = [
      bindScrollPassthrough(s3ContentRef),
      bindScrollPassthrough(s4ContentRef),
      bindScrollPassthrough(s5ContentRef),
    ]

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [])

  useEffect(() => {
    let rafId = null
    lastFrame.current = performance.now()

    const updateTarget = () => {
      const el = transitionRef.current
      if (!el) return
      const scrollDistance = el.offsetHeight - window.innerHeight
      targetProgress.current = scrollDistance > 0
        ? Math.min(Math.max(window.scrollY / scrollDistance, 0), 1)
        : 0
    }

    const tick = (now) => {
      const dt = Math.min((now - (lastFrame.current || now)) / 1000, 0.05)
      lastFrame.current = now

      const inSection2 =
        targetProgress.current >= SECTION2_START
        && targetProgress.current <= S2_EXIT_FADE_END
      const scrollLambda = inSection2 ? SMOOTH.scrollSection2 : SMOOTH.scroll
      smoothProgress.current = damp(smoothProgress.current, targetProgress.current, scrollLambda, dt)
      const p = smoothProgress.current

      const brightenTarget = Math.min(p / BRIGHTEN_END, 1)
      const lightPassTarget = p < BG_FADE_START
        ? 0
        : (p - BG_FADE_START) / (SECTION2A_END - BG_FADE_START)
      const heroFadeTarget = p < HERO_FADE_START
        ? 0
        : p < HERO_FADE_END
          ? (p - HERO_FADE_START) / (HERO_FADE_END - HERO_FADE_START)
          : 1

      const s2aTarget = p < SECTION2_START
        ? 0
        : p < SECTION2A_END
          ? (p - SECTION2_START) / (SECTION2A_END - SECTION2_START)
          : 1

      const s2bTarget = p < SECTION2B_START
        ? 0
        : p < SECTION2B_END
          ? (p - SECTION2B_START) / (SECTION2B_END - SECTION2B_START)
          : 1

      const s2ExitBrightenTarget = p < S2_EXIT_BRIGHTEN_START
        ? 0
        : Math.min(1, (p - S2_EXIT_BRIGHTEN_START) / (S2_EXIT_BRIGHTEN_END - S2_EXIT_BRIGHTEN_START))

      const s2ExitFadeTarget = p < S2_EXIT_FADE_START
        ? 0
        : Math.min(1, (p - S2_EXIT_FADE_START) / (S2_EXIT_FADE_END - S2_EXIT_FADE_START))

      const s3Target = p < SECTION3_START
        ? 0
        : p < SECTION3_END
          ? (p - SECTION3_START) / (SECTION3_END - SECTION3_START)
          : 1

      const s3ExitBrightenTarget = p < S3_EXIT_BRIGHTEN_START
        ? 0
        : Math.min(1, (p - S3_EXIT_BRIGHTEN_START) / (S3_EXIT_BRIGHTEN_END - S3_EXIT_BRIGHTEN_START))

      const s3ExitFadeTarget = p < S3_EXIT_FADE_START
        ? 0
        : Math.min(1, (p - S3_EXIT_FADE_START) / (S3_EXIT_FADE_END - S3_EXIT_FADE_START))

      const s4Target = p < SECTION4_START
        ? 0
        : p < SECTION4_END
          ? (p - SECTION4_START) / (SECTION4_END - SECTION4_START)
          : 1

      const s4ExitBrightenTarget = p < S4_EXIT_BRIGHTEN_START
        ? 0
        : Math.min(1, (p - S4_EXIT_BRIGHTEN_START) / (S4_EXIT_BRIGHTEN_END - S4_EXIT_BRIGHTEN_START))

      const s4ExitFadeTarget = p < S4_EXIT_FADE_START
        ? 0
        : Math.min(1, (p - S4_EXIT_FADE_START) / (S4_EXIT_FADE_END - S4_EXIT_FADE_START))

      const s5Target = p < SECTION5_START
        ? 0
        : p < SECTION5_END
          ? (p - SECTION5_START) / (SECTION5_END - SECTION5_START)
          : 1

      const s5ExitBrightenTarget = p < S5_EXIT_BRIGHTEN_START
        ? 0
        : Math.min(1, (p - S5_EXIT_BRIGHTEN_START) / (S5_EXIT_BRIGHTEN_END - S5_EXIT_BRIGHTEN_START))

      const s5ExitFadeTarget = p < S5_EXIT_FADE_START
        ? 0
        : Math.min(1, (p - S5_EXIT_FADE_START) / (S5_EXIT_FADE_END - S5_EXIT_FADE_START))

      const s6Target = p < SECTION6_START
        ? 0
        : p < SECTION6_END
          ? (p - SECTION6_START) / (SECTION6_END - SECTION6_START)
          : 1

      brightenSmooth.current = damp(brightenSmooth.current, brightenTarget, SMOOTH.phase, dt)
      lightPassSmooth.current = damp(lightPassSmooth.current, lightPassTarget, SMOOTH.phase, dt)
      heroFadeSmooth.current = damp(heroFadeSmooth.current, heroFadeTarget, SMOOTH.phase, dt)
      s2ExitBrightenSmooth.current = damp(s2ExitBrightenSmooth.current, s2ExitBrightenTarget, SMOOTH.s2Exit, dt)
      s2ExitFadeSmooth.current = damp(s2ExitFadeSmooth.current, s2ExitFadeTarget, SMOOTH.s2Exit, dt)
      s3ExitBrightenSmooth.current = damp(s3ExitBrightenSmooth.current, s3ExitBrightenTarget, SMOOTH.exit, dt)
      s3ExitFadeSmooth.current = damp(s3ExitFadeSmooth.current, s3ExitFadeTarget, SMOOTH.exit, dt)
      s4ExitBrightenSmooth.current = damp(s4ExitBrightenSmooth.current, s4ExitBrightenTarget, SMOOTH.exit, dt)
      s4ExitFadeSmooth.current = damp(s4ExitFadeSmooth.current, s4ExitFadeTarget, SMOOTH.exit, dt)
      s5ExitBrightenSmooth.current = damp(s5ExitBrightenSmooth.current, s5ExitBrightenTarget, SMOOTH.exit, dt)
      s5ExitFadeSmooth.current = damp(s5ExitFadeSmooth.current, s5ExitFadeTarget, SMOOTH.exit, dt)
      section2Smooth.current = damp(section2Smooth.current, s2aTarget, SMOOTH.section, dt)
      panSmooth.current = damp(panSmooth.current, s2bTarget, SMOOTH.pan, dt)
      alignSmooth.current = damp(alignSmooth.current, 1 - s2bTarget, SMOOTH.align, dt)
      section3Smooth.current = damp(section3Smooth.current, s3Target, SMOOTH.section3, dt)
      section4Smooth.current = damp(section4Smooth.current, s4Target, SMOOTH.section4, dt)
      section5Smooth.current = damp(section5Smooth.current, s5Target, SMOOTH.section5, dt)
      section6Smooth.current = damp(section6Smooth.current, s6Target, SMOOTH.section6, dt)

      const brighten = easeInOutQuint(brightenSmooth.current)
      const lightPass = easeInOutCubic(Math.min(1, lightPassSmooth.current))
      const heroFade = easeOutCubic(Math.min(1, heroFadeSmooth.current))
      const s2ExitBrighten = easeInOutQuint(s2ExitBrightenSmooth.current)
      const s2ExitFade = easeOutCubic(Math.min(1, s2ExitFadeSmooth.current))
      const s3ExitBrighten = easeInOutQuint(s3ExitBrightenSmooth.current)
      const s3ExitFade = easeOutCubic(Math.min(1, s3ExitFadeSmooth.current))
      const s4ExitBrighten = easeInOutQuint(s4ExitBrightenSmooth.current)
      const s4ExitFade = easeOutCubic(Math.min(1, s4ExitFadeSmooth.current))
      const s5ExitBrighten = easeInOutQuint(s5ExitBrightenSmooth.current)
      const s5ExitFade = easeOutCubic(Math.min(1, s5ExitFadeSmooth.current))
      const s2a = section2Smooth.current
      const panRaw = panSmooth.current
      const pan = easeOutCubic(panRaw)
      const centerBlend = easeOutCubic(alignSmooth.current)
      const s3 = section3Smooth.current
      const s4 = section4Smooth.current
      const s5 = section5Smooth.current
      const s6 = section6Smooth.current
      const raysEnter = easeOutCubic(Math.min(1, s2a * 1.05))
      const heroOpacity = 1 - heroFade

      const bridgeRise = p < S3_BRIDGE_START
        ? 0
        : p < S3_BRIDGE_PEAK
          ? (p - S3_BRIDGE_START) / (S3_BRIDGE_PEAK - S3_BRIDGE_START)
          : p < S3_BRIDGE_END
            ? 1 - (p - S3_BRIDGE_PEAK) / (S3_BRIDGE_END - S3_BRIDGE_PEAK)
            : 0
      const bridgeBright = easeOutCubic(Math.min(1, s3ExitBrighten * 1.05))
      const bridgeExit = 1 - easeOutCubic(Math.min(1, s4 * 1.3))
      const bridgeOpacity = easeOutCubic(Math.max(0, bridgeRise)) * bridgeBright * bridgeExit
      const bridgeIn = easeOutCubic(Math.max(0, bridgeRise))

      colorBendsRef.current?.setTargets({
        intensity: 1.5 + brighten * 3.5 - lightPass * 4,
        scale: 1 - brighten * 0.55 + lightPass * 0.55,
        exposure: 1 + brighten * 1.8 - lightPass * 1.8,
        bloom: brighten * 1.4 - lightPass * 1.4,
        bandWidth: 6 - brighten * 2.5 + lightPass * 2.5,
        mouseInfluence: (1 - brighten * 0.7) * (1 - lightPass),
      })

      const labelIn = stagger(s2a, 0, 0.65)
      const headingIn = stagger(s2a, 0.06, 0.7)
      const descIn = stagger(s2a, 0.16, 0.65)
      const ctaIn = stagger(s2a, 0.55, 0.6)
      const statIns = STATS_A.map((_, i) => stagger(s2a, 0.28 + i * 0.07, 0.55))
      const labelIns = STATS_A.map((_, i) => stagger(s2a, 0.38 + i * 0.07, 0.5))

      const s3LabelIn = stagger(s3, 0, 0.6)
      const s3HeadingIn = stagger(s3, 0.08, 0.65)
      const s3DescIn = stagger(s3, 0.18, 0.6)
      const s3AccordionIn = stagger(s3, 0.3, 0.65)

      const s4LabelIn = stagger(s4, 0, 0.6)
      const s4HeadingIn = stagger(s4, 0.08, 0.65)
      const s4DescIn = stagger(s4, 0.16, 0.6)
      const s4GridIn = stagger(s4, 0.28, 0.65)
      const s4CardIns = ALLIANCE_CARDS.map((_, i) => stagger(s4, 0.3 + i * 0.08, 0.55))
      const s4ItemIns = Array.from({ length: ALLIANCE_ITEM_COUNT }, (_, i) =>
        stagger(s4, 0.38 + i * 0.05, 0.48)
      )

      const s5LabelIn = stagger(s5, 0, 0.6)
      const s5HeadingIn = stagger(s5, 0.08, 0.65)
      const s5DescIn = stagger(s5, 0.16, 0.6)
      const s5GridIn = stagger(s5, 0.28, 0.65)
      const s5CardIns = WHO_WE_ARE_PILLARS.map((_, i) => stagger(s5, 0.32 + i * 0.06, 0.5))

      const s6FormIn = stagger(s6, 0.1, 0.65)

      const s3ContentOpacity = 1 - easeOutCubic(s3ExitBrighten)
      const s4ContentOpacity = 1 - easeOutCubic(s4ExitBrighten)
      const s5ContentOpacity = 1 - easeOutCubic(s5ExitBrighten)

      if (statIns.some((v) => v > 0.2) && !countAnimA.current.active) {
        countAnimA.current.active = true
        countAnimA.current.start = now
      }
      if (s2a < 0.08) countAnimA.current = { active: false, start: 0, progress: 0 }
      else if (countAnimA.current.active) {
        countAnimA.current.progress = Math.min(1, easeOutExpo((now - countAnimA.current.start) / 2400))
      }

      if (s2bTarget > 0.08 && !countAnimB.current.active) {
        countAnimB.current.active = true
        countAnimB.current.start = now
      }
      if (s2bTarget < 0.05) countAnimB.current = { active: false, start: 0, progress: 0 }
      else if (countAnimB.current.active) {
        countAnimB.current.progress = Math.min(1, easeOutExpo((now - countAnimB.current.start) / 2600))
      }

      const cpA = countAnimA.current.progress
      const cpB = countAnimB.current.progress
      const isWide = window.innerWidth >= 1024
      const s2ContentOpacity = 1 - easeOutCubic(s2ExitBrighten)
      const s2SectionFade = s2ExitFade
      const basePad = isWide ? 56 : window.innerWidth >= 768 ? 40 : 24
      const gapVal = panRaw * (isWide ? 3.5 : 2.5)
      const padVal = panRaw * (isWide ? 56 : 32)
      const aWidthPct = lerp(100, PART_A_SPLIT_PCT, panRaw)
      const bWidthPct = PART_B_SPLIT_PCT * panRaw
      const bReveal = easeOutCubic(panRaw)

      sideRaysRef.current?.setTargets({
        intensity: raysEnter * (3 + s2ExitBrighten * 6),
        opacity: raysEnter * (1 + s2ExitBrighten * 1.2),
        saturation: raysEnter * (1.8 + s2ExitBrighten * 1.2),
        falloff: 1.2 - s2ExitBrighten * 0.55,
        spread: raysEnter * (2.5 + s2ExitBrighten * 1.5),
        blend: 0.75 + s2ExitBrighten * 0.15,
      })

      if (bgRef.current) bgRef.current.style.opacity = String(1 - lightPass)
      if (heroTextRef.current) {
        heroTextRef.current.style.opacity = String(heroOpacity)
        heroTextRef.current.style.filter = heroFade > 0.01 ? `blur(${heroFade * 8}px)` : 'none'
        heroTextRef.current.style.transform = `translateY(${brighten * -16 - heroFade * 12}px) scale(${1 - heroFade * 0.03})`
      }
      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String(
          Math.max(0, heroOpacity - s2a * 0.5 - pan * 0.8 - s2ExitBrighten * 1.5 - s3 * 0.5 - bridgeOpacity * 1.2 - s4 * 0.8 - s5 * 0.9 - s6 * 0.95)
        )
      }
      if (scrollHintTextRef.current) {
        scrollHintTextRef.current.textContent =
          bridgeOpacity > 0.2 || s3ExitBrighten > 0.15 || s4ExitBrighten > 0.15 || s5ExitBrighten > 0.15 || s6 > 0.12
            ? ''
            : s5 > 0.15
              ? 'Keep scrolling'
              : s4 > 0.15
              ? 'Keep scrolling'
              : s2ExitBrighten > 0.15 || s3 > 0.15
              ? 'Keep scrolling'
              : pan > 0.92
                ? 'Keep scrolling'
                : s2a > 0.75
                  ? 'Keep scrolling'
                  : 'Scroll'
      }
      if (section2Ref.current) {
        section2Ref.current.style.opacity = String(
          easeOutCubic(Math.min(1, s2a * 1.1)) * (1 - s2SectionFade)
        )
      }
      if (section3Ref.current) {
        section3Ref.current.style.opacity = String(
          easeOutCubic(Math.min(1, s3 * 1.1)) * (1 - s3ExitFade)
        )
      }
      if (section4Ref.current) {
        section4Ref.current.style.opacity = String(
          easeOutCubic(Math.min(1, s4 * 1.1)) * (1 - s4ExitFade)
        )
      }
      if (section5Ref.current) {
        section5Ref.current.style.opacity = String(
          easeOutCubic(Math.min(1, s5 * 1.1)) * (1 - s5ExitFade)
        )
      }
      if (section6Ref.current) {
        section6Ref.current.style.opacity = String(easeOutCubic(Math.min(1, s6 * 1.1)))
      }

      const s2Opacity = section2Ref.current
        ? parseFloat(section2Ref.current.style.opacity) || 0
        : 0
      const s3Opacity = section3Ref.current
        ? parseFloat(section3Ref.current.style.opacity) || 0
        : 0
      const s4Opacity = section4Ref.current
        ? parseFloat(section4Ref.current.style.opacity) || 0
        : 0
      const s5Opacity = section5Ref.current
        ? parseFloat(section5Ref.current.style.opacity) || 0
        : 0
      const s6Opacity = section6Ref.current
        ? parseFloat(section6Ref.current.style.opacity) || 0
        : 0

      const POINTER_THRESHOLD = 0.08
      const stackedLayers = [
        { ref: heroTextRef, opacity: heroOpacity, rank: 0 },
        { ref: section2Ref, opacity: s2Opacity, rank: 1 },
        { ref: section3Ref, opacity: s3Opacity, rank: 2 },
        { ref: section4Ref, opacity: s4Opacity, rank: 3 },
        { ref: section5Ref, opacity: s5Opacity, rank: 4 },
        { ref: section6Ref, opacity: s6Opacity, rank: 5 },
      ]
      const activeRank = stackedLayers
        .filter((layer) => layer.opacity > POINTER_THRESHOLD)
        .sort((a, b) => b.rank - a.rank)[0]?.rank ?? null

      stackedLayers.forEach(({ ref, rank }) => {
        if (!ref.current) return
        ref.current.style.pointerEvents = rank === activeRank ? 'auto' : 'none'
      })

      if (s5BrightOverlayRef.current) {
        s5BrightOverlayRef.current.style.opacity = String(Math.min(1, s5ExitBrighten * 1.15))
      }
      if (s5AuroraBrightRef.current) {
        s5AuroraBrightRef.current.style.filter = s5ExitBrighten > 0.01
          ? `brightness(${1 + s5ExitBrighten * 3.6}) saturate(${1 + s5ExitBrighten * 1.5})`
          : 'none'
      }
      if (s5ContentRef.current) {
        const s5ScrollEl = s5ContentRef.current

        if (s5Opacity > 0.12 && !s5ScrollPrimedRef.current) {
          s5ScrollEl.scrollTop = 0
          s5ScrollPrimedRef.current = true
        }
        if (s5Opacity < 0.05) {
          s5ScrollPrimedRef.current = false
        }

        s5ScrollEl.style.opacity = String(s5ContentOpacity)
        s5ScrollEl.style.filter = s5ExitBrighten > 0.01
          ? `blur(${s5ExitBrighten * 10}px)`
          : 'none'
        s5ScrollEl.style.transform = s5ExitBrighten > 0.01
          ? `translateY(${s5ExitBrighten * -16}px) scale(${1 - s5ExitBrighten * 0.03})`
          : 'none'
      }

      if (s4BrightOverlayRef.current) {
        s4BrightOverlayRef.current.style.opacity = String(Math.min(1, s4ExitBrighten * 1.15))
      }
      if (s4PillarBrightRef.current) {
        s4PillarBrightRef.current.style.filter = s4ExitBrighten > 0.01
          ? `brightness(${1 + s4ExitBrighten * 3.8}) saturate(${1 + s4ExitBrighten * 1.4})`
          : 'none'
      }
      if (s4ContentRef.current) {
        const s4ScrollEl = s4ContentRef.current

        if (s4Opacity > 0.12 && !s4ScrollPrimedRef.current) {
          s4ScrollEl.scrollTop = 0
          s4ScrollPrimedRef.current = true
        }
        if (s4Opacity < 0.05) {
          s4ScrollPrimedRef.current = false
        }

        s4ScrollEl.style.opacity = String(s4ContentOpacity)
        s4ScrollEl.style.filter = s4ExitBrighten > 0.01
          ? `blur(${s4ExitBrighten * 10}px)`
          : 'none'
        s4ScrollEl.style.transform = s4ExitBrighten > 0.01
          ? `translateY(${s4ExitBrighten * -16}px) scale(${1 - s4ExitBrighten * 0.03})`
          : 'none'
      }

      if (s3BrightOverlayRef.current) {
        s3BrightOverlayRef.current.style.opacity = String(Math.min(1, s3ExitBrighten * 1.2))
      }
      if (s3AccentGlowRef.current) {
        s3AccentGlowRef.current.style.opacity = String(0.28 + s3ExitBrighten * 0.92)
      }
      if (s3VeilWrapRef.current) {
        s3VeilWrapRef.current.style.filter = s3ExitBrighten > 0.01
          ? `brightness(${1 + s3ExitBrighten * 4.2}) saturate(${1 + s3ExitBrighten * 1.6}) contrast(${1 + s3ExitBrighten * 0.3})`
          : 'none'
      }
      if (s3ContentRef.current) {
        const s3ScrollEl = s3ContentRef.current

        if (s3Opacity > 0.12 && !s3ScrollPrimedRef.current) {
          s3ScrollEl.scrollTop = 0
          s3ScrollPrimedRef.current = true
        }
        if (s3Opacity < 0.05) {
          s3ScrollPrimedRef.current = false
        }

        s3ScrollEl.style.opacity = String(s3ContentOpacity)
        s3ScrollEl.style.filter = s3ExitBrighten > 0.01
          ? `blur(${s3ExitBrighten * 10}px)`
          : 'none'
        s3ScrollEl.style.transform = s3ExitBrighten > 0.01
          ? `translateY(${s3ExitBrighten * -16}px) scale(${1 - s3ExitBrighten * 0.03})`
          : 'none'
      }

      if (s3BridgeRef.current) {
        s3BridgeRef.current.style.opacity = String(bridgeOpacity)
      }
      if (s3BridgeQuoteRef.current) {
        const y = (1 - bridgeIn) * 28 - s4 * 14
        const blur = (1 - bridgeIn) * 8 + s4 * 6
        s3BridgeQuoteRef.current.style.opacity = String(bridgeOpacity)
        s3BridgeQuoteRef.current.style.transform = `translateY(${y}px) scale(${0.97 + bridgeIn * 0.03})`
        s3BridgeQuoteRef.current.style.filter = blur > 0.01 ? `blur(${blur}px)` : 'none'
      }
      if (s3BridgeAttrRef.current) {
        const attrIn = stagger(bridgeIn, 0.2, 0.55)
        applyEntrance(s3BridgeAttrRef.current, attrIn * bridgeExit, { y: 14, blur: 5 })
      }

      const s4Settle = s4 > 0 ? easeOutCubic(Math.min(1, s4 * 1.4)) : 0
      lightPillarRef.current?.setTargets({
        intensity: 0.62 + s3ExitBrighten * 0.9 - s4Settle * 0.15 + s4ExitBrighten * 0.85,
        glowAmount: 0.0012 + s3ExitBrighten * 0.003 + s4Settle * 0.0004 + s4ExitBrighten * 0.004,
      })
      if (s4PillarWrapRef.current) {
        s4PillarWrapRef.current.style.opacity = String(
          Math.min(1, s3ExitBrighten * 0.65 + s4 * 0.95)
        )
      }

      if (s5AuroraWrapRef.current) {
        s5AuroraWrapRef.current.style.opacity = String(
          Math.min(1, s4ExitBrighten * 0.55 + s5 * 0.95)
        )
      }

      if (s6RaysWrapRef.current) {
        const s6RaysEnter = easeOutCubic(Math.min(1, s5ExitBrighten * 0.85 + s6 * 1.05))
        s6RaysWrapRef.current.style.opacity = String(
          Math.min(1, s5ExitBrighten * 0.5 + s6 * 0.98)
        )
        s6RaysWrapRef.current.style.filter = s6RaysEnter > 0.01
          ? `brightness(${0.85 + s6RaysEnter * 0.35 + s5ExitBrighten * 0.4})`
          : 'none'
      }

      const mobilePartAFade = isWide ? 1 : Math.max(0, 1 - easeOutCubic(Math.min(1, panRaw * 1.8)))
      const mobilePartBReveal = isWide ? bReveal : easeOutCubic(Math.max(0, (panRaw - 0.18) / 0.82))
      const aContentBlend = isWide ? centerBlend : 1

      if (s2StageRef.current) {
        const stage = s2StageRef.current

        if (isWide) {
          stage.style.flexDirection = 'row'
          stage.style.justifyContent = s2a > 0.1 ? 'center' : 'flex-start'
          stage.style.alignItems = 'center'
          stage.style.gap = `${gapVal}rem`
          stage.style.paddingLeft = `${basePad + padVal}px`
          stage.style.paddingRight = `${basePad + padVal}px`
        } else {
          stage.style.flexDirection = 'column'
          stage.style.justifyContent = 'center'
          stage.style.alignItems = 'stretch'
          stage.style.gap = '0'
          stage.style.paddingLeft = '0'
          stage.style.paddingRight = '0'
        }
        stage.style.opacity = String(s2ContentOpacity)
        stage.style.filter = s2ExitBrighten > 0.01
          ? `blur(${s2ExitBrighten * 8}px)`
          : 'none'
        stage.style.transform = s2ExitBrighten > 0.01
          ? `translateY(${s2ExitBrighten * -14}px)`
          : 'none'
      }

      if (s2PartARef.current && s2StageRef.current) {
        const el = s2PartARef.current

        if (isWide) {
          el.style.position = 'relative'
          el.style.inset = 'auto'
          el.style.display = 'block'
          el.style.flex = `0 0 ${aWidthPct}%`
          el.style.width = `${aWidthPct}%`
          el.style.maxWidth = `${aWidthPct}%`
          el.style.transform = 'translateX(0)'
          el.style.marginLeft = '0'
          el.style.marginRight = '0'
          el.style.alignItems = 'stretch'
          el.style.justifyContent = 'flex-start'
          el.style.opacity = '1'
          el.style.pointerEvents = 'auto'
        } else {
          el.style.position = 'absolute'
          el.style.inset = 'auto'
          el.style.top = '0'
          el.style.bottom = '0'
          el.style.left = `${basePad}px`
          el.style.right = `${basePad}px`
          el.style.display = 'flex'
          el.style.flex = 'none'
          el.style.width = 'auto'
          el.style.maxWidth = 'none'
          el.style.alignItems = 'center'
          el.style.justifyContent = 'center'
          el.style.transform = `translateY(${(1 - mobilePartAFade) * -18}px)`
          el.style.marginLeft = '0'
          el.style.marginRight = '0'
          el.style.opacity = String(mobilePartAFade * s2ContentOpacity)
          el.style.pointerEvents = mobilePartAFade < 0.45 ? 'none' : 'auto'
        }
      }

      if (s2PartAContentRef.current) {
        const el = s2PartAContentRef.current

        el.style.paddingLeft = '0'
        el.style.paddingRight = '0'
        el.style.textAlign = 'left'
        el.style.alignItems = 'flex-start'
        el.style.width = '100%'
        el.style.maxWidth = isWide ? 'none' : '100%'
        el.style.transform = isWide
          ? `translateX(calc(${aContentBlend} * (100% - min(42rem, 100%)) / 2))`
          : 'none'
      }

      if (s2DescRef.current) {
        s2DescRef.current.style.marginLeft = '0'
        s2DescRef.current.style.marginRight = '0'
        s2DescRef.current.style.maxWidth = 'min(42rem, 100%)'
      }

      if (s2HeadingRef.current) {
        s2HeadingRef.current.style.marginLeft = '0'
        s2HeadingRef.current.style.marginRight = '0'
        s2HeadingRef.current.style.maxWidth = 'min(42rem, 100%)'
      }

      if (s2StatsRef.current) {
        s2StatsRef.current.style.marginLeft = '0'
        s2StatsRef.current.style.marginRight = '0'
      }

      if (s2LabelRef.current) {
        s2LabelRef.current.style.width = 'auto'
        s2LabelRef.current.style.textAlign = 'left'
      }

      if (s2PartBRef.current) {
        const el = s2PartBRef.current

        if (isWide) {
          el.style.position = 'relative'
          el.style.inset = 'auto'
          el.style.display = 'block'
          el.style.flex = `0 0 ${bWidthPct}%`
          el.style.width = `${bWidthPct}%`
          el.style.maxWidth = `${bWidthPct}%`
          el.style.transform = 'translateY(0)'
          el.style.alignItems = 'stretch'
          el.style.justifyContent = 'flex-start'
          el.style.maxHeight = 'none'
        } else {
          el.style.position = 'absolute'
          el.style.inset = 'auto'
          el.style.top = '0'
          el.style.bottom = '0'
          el.style.left = `${basePad}px`
          el.style.right = `${basePad}px`
          el.style.display = 'flex'
          el.style.flex = 'none'
          el.style.width = 'auto'
          el.style.maxWidth = 'none'
          el.style.maxHeight = 'none'
          el.style.alignItems = 'center'
          el.style.justifyContent = 'center'
          el.style.transform = `translateY(${(1 - mobilePartBReveal) * 24}px)`
        }

        el.style.opacity = String((isWide ? bReveal : mobilePartBReveal) * s2ContentOpacity)
        el.style.visibility = (isWide ? panRaw > 0.02 : mobilePartBReveal > 0.02) ? 'visible' : 'hidden'
        el.style.pointerEvents = (isWide ? panRaw : mobilePartBReveal) > 0.12 ? 'auto' : 'none'
        el.style.overflow = isWide ? 'visible' : 'hidden'
      }

      applyEntrance(s2LabelRef.current, labelIn, { y: 16, blur: 6 })
      applyEntrance(s2HeadingRef.current, headingIn, { y: 32, blur: 10 })
      applyEntrance(s2DescRef.current, descIn, { y: 20, blur: 6 })
      applyEntrance(s2CtaRef.current, ctaIn, { y: 18, blur: 4 })

      STATS_A.forEach((stat, i) => {
        applyEntrance(statColRefs.current[i], statIns[i], { y: 28, blur: 6 })
        applyEntrance(statLabelRefs.current[i], labelIns[i], { y: 14, blur: 4 })
        const numEl = statNumRefs.current[i]
        if (numEl) {
          numEl.textContent = formatCount(stat.target, stat.suffix, cpA)
          numEl.style.transform = `scale(${0.92 + cpA * 0.08})`
          numEl.style.opacity = String(statIns[i])
        }
      })

      STATS_B.forEach((stat, i) => {
        const partBReveal = isWide ? bReveal : mobilePartBReveal
        if ((isWide ? panRaw : partBReveal) < 0.02) return
        const cardIn = stagger(isWide ? pan : mobilePartBReveal, 0.04 + i * 0.09, 0.48)
        const eased = easeOutCubic(cardIn)
        const slideX = (1 - eased) * (isWide ? 40 : 24)
        const slideY = (1 - eased) * 16
        const el = bCardRefs.current[i]
        if (el) {
          el.style.opacity = String(eased * partBReveal * s2ContentOpacity)
          el.style.transform = `translate(${slideX}px, ${slideY}px) scale(${0.96 + eased * 0.04})`
          el.style.filter = `blur(${(1 - eased) * 5}px)`
        }
        const numEl = bCardNumRefs.current[i]
        if (numEl && cardIn > 0.08) {
          const countProgress = Math.min(1, cpB * (0.35 + cardIn * 0.65))
          numEl.textContent = formatCount(stat.target, stat.suffix, countProgress, stat.decimal)
        }
      })

      applyEntrance(s3LabelRef.current, s3LabelIn * s3ContentOpacity, { y: 16, blur: 6 })
      applyEntrance(s3HeadingRef.current, s3HeadingIn * s3ContentOpacity, { y: 28, blur: 8 })
      applyEntrance(s3DescRef.current, s3DescIn * s3ContentOpacity, { y: 18, blur: 5 })
      applyEntrance(s3AccordionRef.current, s3AccordionIn * s3ContentOpacity, { y: 28, blur: 8 })

      applyEntrance(s4LabelRef.current, s4LabelIn * s4ContentOpacity, { y: 16, blur: 6 })
      applyEntrance(s4HeadingRef.current, s4HeadingIn * s4ContentOpacity, { y: 32, blur: 10 })
      applyEntrance(s4DescRef.current, s4DescIn * s4ContentOpacity, { y: 20, blur: 6 })
      applyEntrance(s4GridRef.current, s4GridIn * s4ContentOpacity, { y: 24, blur: 6 })
      ALLIANCE_CARDS.forEach((_, i) => {
        applyEntrance(s4CardRefs.current[i], s4CardIns[i] * s4ContentOpacity, { y: 22, blur: 5 })
      })
      for (let i = 0; i < ALLIANCE_ITEM_COUNT; i += 1) {
        applyEntrance(s4ItemRefs.current[i], s4ItemIns[i] * s4ContentOpacity, { y: 16, blur: 4 })
      }

      applyEntrance(s5LabelRef.current, s5LabelIn * s5ContentOpacity, { y: 16, blur: 6 })
      applyEntrance(s5HeadingRef.current, s5HeadingIn * s5ContentOpacity, { y: 32, blur: 10 })
      applyEntrance(s5DescRef.current, s5DescIn * s5ContentOpacity, { y: 20, blur: 6 })
      applyEntrance(s5GridRef.current, s5GridIn * s5ContentOpacity, { y: 24, blur: 6 })
      WHO_WE_ARE_PILLARS.forEach((_, i) => {
        applyEntrance(s5CardRefs.current[i], s5CardIns[i] * s5ContentOpacity, { y: 22, blur: 5 })
      })

      applyEntrance(s6FormRef.current, s6FormIn, { y: 28, blur: 8 })

      rafId = requestAnimationFrame(tick)
    }

    const onScroll = () => updateTarget()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    updateTarget()
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="bg-[#120F17]">
      <div
        ref={transitionRef}
        className="relative"
        style={{ height: `${SCROLL_PAGE_HEIGHT_VH}vh` }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#120F17]">
          <div ref={bgRef} className="absolute inset-0 will-change-[opacity]">
            <ColorBends
              ref={colorBendsRef}
              colors={['#8a5cff', '#ff5c7a']}
              rotation={90}
              speed={0.2}
              scale={1}
              frequency={1}
              warpStrength={1}
              mouseInfluence={1}
              noise={0.15}
              parallax={0.5}
              iterations={1}
              intensity={1.5}
              bandWidth={6}
              exposure={1}
              bloom={0}
              transparent
              autoRotate={0}
            />
          </div>

          <section
            ref={heroTextRef}
            className="absolute inset-0 z-10 flex items-center justify-center px-6 will-change-[opacity,transform,filter]"
          >
            <div className="text-center">
              <h1 className="neon-hero-heading text-[clamp(2.5rem,10vw,7rem)]">
                MARKETING
                <br />
                DONE RIGHT
              </h1>
              <p className="neon-hero-sub mt-6 text-[clamp(0.65rem,2vw,1rem)]">
                ENGINEERED TO GROW.
              </p>
            </div>
          </section>

          <section
            ref={section2Ref}
            className="absolute inset-0 z-10 overflow-hidden bg-[#120F17]"
            style={{ opacity: 0 }}
          >
            <div className="absolute inset-0">
              <SideRays
                ref={sideRaysRef}
                speed={2.5}
                rayColor1="#8a5cff"
                rayColor2="#ff5c7a"
                intensity={3}
                spread={2.5}
                origin="top-right"
                tilt={0}
                saturation={1.8}
                blend={0.75}
                falloff={1.2}
                opacity={1}
              />
            </div>

            <div
              ref={s2StageRef}
              className="relative z-10 flex h-full w-full items-center overflow-hidden will-change-[opacity,transform,filter] lg:px-14"
            >
              {/* Part A — full screen centred until Part B scroll */}
              <div
                ref={s2PartARef}
                className="min-w-0 shrink-0 will-change-[width,flex-basis,transform]"
              >
                <div
                  ref={s2PartAContentRef}
                  className="flex w-full flex-col will-change-transform"
                >
                <p
                  ref={s2LabelRef}
                  className="neon-hero-sub mb-6 text-[10px] tracking-[0.35em] will-change-[opacity,transform,filter] md:text-xs"
                  style={{ opacity: 0, color: 'var(--neon-purple)' }}
                >
                  AIP CONFERENCE 2026 · ENSEMBLE DIGITAL LABS
                </p>

                <h2
                  ref={s2HeadingRef}
                  className="overflow-visible font-[Orbitron] text-[clamp(1.5rem,4vw,2.75rem)] font-black leading-tight tracking-tight text-slate-100 italic will-change-[opacity,transform,filter]"
                  style={{ opacity: 0 }}
                >
                  Independent practices
                  <br />
                  deserve{' '}
                  <span className="neon-accent">enterprise</span>
                  <br />
                  <span className="neon-accent">infrastructure.</span>
                </h2>

                <p
                  ref={s2DescRef}
                  className="mt-5 text-sm leading-relaxed text-zinc-400 will-change-[opacity,transform,filter] md:text-base"
                  style={{ opacity: 0 }}
                >
                  Hospital systems have the IT, AI, and marketing engines. You have the
                  patient relationships, clinical agility, and community trust. We give you
                  the infrastructure to make independence win.
                </p>

                <div
                  ref={s2StatsRef}
                  className="mt-8 grid w-full max-w-3xl grid-cols-3 gap-3 sm:gap-6"
                >
                  {STATS_A.map((stat, i) => (
                    <div
                      key={stat.label}
                      ref={(el) => { statColRefs.current[i] = el }}
                      style={{ opacity: 0 }}
                    >
                      <p
                        ref={(el) => { statNumRefs.current[i] = el }}
                        className="neon-stat text-[clamp(1.5rem,4vw,2.5rem)] leading-none"
                        style={{ opacity: 0 }}
                      >
                        0{stat.suffix}
                      </p>
                      <p
                        ref={(el) => { statLabelRefs.current[i] = el }}
                        className="mt-1.5 text-xs leading-snug text-zinc-500"
                        style={{ opacity: 0 }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div ref={s2CtaRef} className="mt-8 flex" style={{ opacity: 0 }}>
                  <button className="group neon-cta-border relative overflow-hidden rounded-full p-[2px] shadow-[0_0_25px_rgba(138,92,255,0.3)] transition-shadow hover:shadow-[0_0_40px_rgba(255,92,122,0.35)]">
                    <span className="flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-sm font-semibold tracking-wide transition-colors group-hover:bg-zinc-950">
                      <span className="neon-cta-text font-[Orbitron] uppercase italic">
                        Get your free practice audit
                      </span>
                      <span className="text-[var(--neon-pink)] transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </button>
                </div>
                </div>
              </div>

              {/* Part B — zero width until scroll triggers split layout */}
              <div
                ref={s2PartBRef}
                className="min-w-0 shrink-0 overflow-visible opacity-0 will-change-[width,flex-basis,opacity,transform]"
                style={{ flex: '0 0 0', width: 0 }}
              >
                <div className="flex w-full max-w-lg flex-col gap-3 overflow-y-auto py-6 md:max-w-none md:overflow-visible md:py-0">
                  {STATS_B.map((stat, i) => (
                    <div
                      key={stat.label}
                      ref={(el) => { bCardRefs.current[i] = el }}
                      className="neon-stat-card flex items-center gap-4 rounded-xl px-5 py-4 will-change-[opacity,transform,filter]"
                      style={{ opacity: 0 }}
                    >
                      <p
                        ref={(el) => { bCardNumRefs.current[i] = el }}
                        className="neon-stat shrink-0 text-[clamp(1.5rem,3vw,2.25rem)] leading-none"
                      >
                        0{stat.suffix}
                      </p>
                      <p className="text-xs leading-relaxed text-zinc-400 md:text-sm">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            ref={section3Ref}
            className="absolute inset-0 z-[11] overflow-hidden bg-[#120F17]"
            style={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-[#120F17]" />
            <div ref={s3VeilWrapRef} className="absolute inset-0 will-change-[filter]">
              <DarkVeil
                hueShift={52}
                noiseIntensity={0.04}
                scanlineIntensity={0.1}
                scanlineFrequency={1.4}
                speed={0.42}
                warpAmount={0.38}
              />
            </div>
            <div
              ref={s3AccentGlowRef}
              className="pointer-events-none absolute inset-0 will-change-[opacity]"
              style={{
                opacity: 0.28,
                background:
                  'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(138, 92, 255, 0.18), transparent 65%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(255, 92, 122, 0.1), transparent 55%)',
              }}
            />
            <div
              ref={s3BrightOverlayRef}
              className="pointer-events-none absolute inset-0 z-20 mix-blend-screen will-change-[opacity]"
              style={{
                opacity: 0,
                background:
                  'radial-gradient(ellipse 100% 90% at 50% 38%, rgba(110, 255, 220, 0.98) 0%, rgba(72, 235, 195, 0.88) 18%, rgba(48, 210, 170, 0.72) 32%, rgba(36, 185, 150, 0.52) 46%, rgba(138, 92, 255, 0.38) 62%, rgba(255, 92, 122, 0.22) 74%, transparent 82%)',
              }}
            />

            <div
              ref={s3ContentRef}
              className="section-scroll-content relative z-10 flex h-full min-h-0 w-full flex-col items-center justify-start overflow-y-auto px-3 pt-6 pb-8 will-change-[opacity,transform,filter] sm:px-4 md:px-4 md:py-10 lg:px-5"
            >
              <div className="w-full max-w-6xl shrink-0 text-center">
                <p
                  ref={s3LabelRef}
                  className="veil-eyebrow mb-4 text-[9px] font-semibold uppercase will-change-[opacity,transform,filter] md:text-[10px]"
                  style={{ opacity: 0 }}
                >
                  DOES THIS SOUND FAMILIAR?
                </p>

                <h2
                  ref={s3HeadingRef}
                  className="font-[Orbitron] text-[clamp(1.25rem,3.5vw,2.25rem)] font-black leading-tight tracking-tight text-slate-100 italic will-change-[opacity,transform,filter]"
                  style={{ opacity: 0 }}
                >
                  The 10 challenges every independent practice faces.
                </h2>

                <p
                  ref={s3DescRef}
                  className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-zinc-400 will-change-[opacity,transform,filter] md:text-sm"
                  style={{ opacity: 0 }}
                >
                  These are the most common problems we hear from independent physicians every week.
                  If any hit home — we should talk.
                </p>

                <div
                  ref={s3AccordionRef}
                  className="mx-auto mt-6 w-full will-change-[opacity,transform,filter]"
                  style={{ opacity: 0 }}
                >
                  <ChallengeAccordion challenges={CHALLENGES} />
                </div>
              </div>
            </div>
          </section>

          <div
            ref={s3BridgeRef}
            className="pointer-events-none absolute inset-0 z-[12] flex items-center justify-center px-6 will-change-[opacity] md:px-10"
            style={{ opacity: 0 }}
            aria-hidden={true}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 90% 80% at 50% 45%, rgba(48, 210, 170, 0.22), rgba(18, 15, 23, 0.55) 55%, rgba(18, 15, 23, 0.92) 78%)',
              }}
            />
            <div className="relative z-10 w-full max-w-3xl text-center">
              <blockquote
                ref={s3BridgeQuoteRef}
                className="font-[Orbitron] text-[clamp(1.05rem,2.4vw,1.65rem)] font-bold italic leading-snug tracking-tight text-slate-100 will-change-[opacity,transform,filter] md:leading-relaxed"
                style={{ opacity: 0 }}
              >
                &ldquo;We are Ensemble Digital Labs — the IT, AI, and marketing team that
                independent practices cannot afford to hire in-house, but now do not have to.&rdquo;
              </blockquote>
              <footer
                ref={s3BridgeAttrRef}
                className="neon-hero-sub mt-6 text-[9px] tracking-[0.22em] will-change-[opacity,transform,filter] md:text-[10px]"
                style={{ opacity: 0, color: 'var(--neon-purple)' }}
              >
                — Ensemble Digital Labs, AIP Conference 2026
              </footer>
            </div>
          </div>

          <section
            ref={section4Ref}
            className="absolute inset-0 z-[11] overflow-hidden bg-[#120F17]"
            style={{ opacity: 0 }}
          >
            <div ref={s4PillarBrightRef} className="absolute inset-0 will-change-[filter]">
              <div ref={s4PillarWrapRef} className="absolute inset-0 will-change-[opacity]" style={{ opacity: 0 }}>
                <LightPillar
                  ref={lightPillarRef}
                  topColor="#5227FF"
                  bottomColor="#FF9FFC"
                  intensity={0.62}
                  rotationSpeed={0.3}
                  glowAmount={0.0012}
                  pillarWidth={3}
                  pillarHeight={0.4}
                  noiseIntensity={0.5}
                  pillarRotation={25}
                  interactive={false}
                  mixBlendMode="screen"
                  quality="high"
                />
              </div>
            </div>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(18, 15, 23, 0.28), rgba(18, 15, 23, 0.82) 72%)',
              }}
            />
            <div
              ref={s4BrightOverlayRef}
              className="pointer-events-none absolute inset-0 z-20 mix-blend-screen will-change-[opacity]"
              style={{
                opacity: 0,
                background:
                  'radial-gradient(ellipse 100% 90% at 50% 42%, rgba(180, 140, 255, 0.95) 0%, rgba(130, 90, 255, 0.82) 20%, rgba(255, 159, 252, 0.55) 42%, rgba(82, 39, 255, 0.28) 62%, transparent 80%)',
              }}
            />

            <div
              ref={s4ContentRef}
              className="section-scroll-content relative z-10 flex h-full min-h-0 w-full flex-col items-center justify-start overflow-y-auto px-5 pt-6 pb-8 will-change-[opacity,transform,filter] sm:px-6 md:px-10 md:py-10 lg:px-14"
            >
              <div className="w-full max-w-6xl shrink-0 text-center">
                <p
                  ref={s4LabelRef}
                  className="neon-hero-sub mb-4 text-[9px] tracking-[0.22em] will-change-[opacity,transform,filter] sm:mb-5 sm:text-[10px] sm:tracking-[0.35em] md:text-xs"
                  style={{ opacity: 0, color: 'var(--neon-purple)' }}
                >
                  THE ALLIANCE ADVANTAGE
                </p>

                <h2
                  ref={s4HeadingRef}
                  className="font-[Orbitron] text-[clamp(1.15rem,5vw,2.5rem)] font-black leading-tight tracking-tight text-slate-100 italic will-change-[opacity,transform,filter]"
                  style={{ opacity: 0 }}
                >
                  The technology gap between you and health systems is now{' '}
                  <span className="neon-accent">closeable.</span>
                </h2>

                <p
                  ref={s4DescRef}
                  className="mx-auto mt-4 max-w-3xl text-xs leading-relaxed text-zinc-400 will-change-[opacity,transform,filter] sm:mt-5 sm:text-sm md:text-base"
                  style={{ opacity: 0 }}
                >
                  Five years ago, enterprise infrastructure cost $2M to deploy.
                  That world no longer exists.
                </p>

                <div
                  ref={s4GridRef}
                  className="mx-auto mt-6 grid w-full gap-3 text-left sm:mt-8 sm:gap-4 lg:mt-10 lg:grid-cols-2 lg:gap-5"
                  style={{ opacity: 0 }}
                >
                  {ALLIANCE_CARDS.map((card, cardIdx) => (
                    <Fragment key={card.title}>
                      {cardIdx > 0 && (
                        <div
                          className="col-span-full flex items-center gap-3 py-1 lg:hidden"
                          aria-hidden="true"
                        >
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(138,92,255,0.45)] to-transparent" />
                          <span className="shrink-0 font-[Orbitron] text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--neon-purple)]">
                            vs
                          </span>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(255,92,122,0.45)] to-transparent" />
                        </div>
                      )}
                      <div
                        ref={(el) => { s4CardRefs.current[cardIdx] = el }}
                        className="neon-stat-card rounded-xl px-4 py-4 will-change-[opacity,transform,filter] sm:px-5 sm:py-5 md:px-6 md:py-6"
                        style={{ opacity: 0 }}
                      >
                        <h3 className="veil-eyebrow text-[8px] font-semibold uppercase sm:text-[9px] md:text-[10px]">
                          {card.title}
                        </h3>
                        <ul className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
                          {card.items.map((item, itemIdx) => {
                            const globalIdx = cardIdx * card.items.length + itemIdx
                            return (
                              <li
                                key={item.label}
                                ref={(el) => { s4ItemRefs.current[globalIdx] = el }}
                                className="flex gap-2.5 will-change-[opacity,transform,filter] sm:gap-3"
                                style={{ opacity: 0 }}
                              >
                                <span
                                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full shadow-[0_0_8px_rgba(138,92,255,0.6)] sm:h-2 sm:w-2"
                                  style={{ background: 'linear-gradient(135deg, var(--neon-purple), var(--neon-pink))' }}
                                  aria-hidden="true"
                                />
                                <div className="min-w-0">
                                  <p className="text-[0.8125rem] font-bold leading-snug text-slate-100 sm:text-sm md:text-base">
                                    {item.label}
                                  </p>
                                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-400 sm:mt-1.5 sm:text-xs md:text-sm">
                                    {item.desc}
                                  </p>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            ref={section5Ref}
            className="absolute inset-0 z-10 overflow-hidden bg-[#120F17]"
            style={{ opacity: 0 }}
          >
            <div ref={s5AuroraBrightRef} className="absolute inset-0 will-change-[filter]">
              <div ref={s5AuroraWrapRef} className="absolute inset-0 will-change-[opacity]" style={{ opacity: 0 }}>
                <Aurora
                  colorStops={AURORA_COLORS}
                  blend={0.62}
                  amplitude={1.45}
                  intensity={1.35}
                  speed={0.45}
                  className="absolute inset-0"
                />
              </div>
            </div>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(18, 15, 23, 0.08), rgba(18, 15, 23, 0.68) 72%)',
              }}
            />
            <div
              ref={s5BrightOverlayRef}
              className="pointer-events-none absolute inset-0 z-20 mix-blend-screen will-change-[opacity]"
              style={{
                opacity: 0,
                background:
                  'radial-gradient(ellipse 100% 90% at 50% 42%, rgba(124, 255, 103, 0.92) 0%, rgba(180, 151, 207, 0.82) 22%, rgba(82, 39, 255, 0.58) 44%, rgba(138, 92, 255, 0.28) 62%, transparent 80%)',
              }}
            />

            <div
              ref={s5ContentRef}
              className="section-scroll-content relative z-10 flex h-full min-h-0 w-full flex-col items-center justify-start overflow-y-auto px-5 pt-6 pb-8 will-change-[opacity,transform,filter] sm:px-6 md:px-10 md:py-10 lg:px-14"
            >
              <div className="w-full max-w-6xl shrink-0 text-center">
                <p
                  ref={s5LabelRef}
                  className="neon-hero-sub mb-4 text-[9px] tracking-[0.22em] will-change-[opacity,transform,filter] sm:mb-5 sm:text-[10px] sm:tracking-[0.35em] md:text-xs"
                  style={{ opacity: 0, color: 'var(--neon-purple)' }}
                >
                  WHO WE ARE
                </p>

                <h2
                  ref={s5HeadingRef}
                  className="font-[Orbitron] text-[clamp(1.15rem,5vw,2.5rem)] font-black leading-tight tracking-tight text-slate-100 italic will-change-[opacity,transform,filter]"
                  style={{ opacity: 0 }}
                >
                  Fortune 100 standards.{' '}
                  <span className="neon-accent">Independent practice price.</span>
                </h2>

                <p
                  ref={s5DescRef}
                  className="mx-auto mt-4 max-w-3xl text-xs leading-relaxed text-zinc-400 will-change-[opacity,transform,filter] sm:mt-5 sm:text-sm md:text-base"
                  style={{ opacity: 0 }}
                >
                  Our team built enterprise infrastructure at Fortune 100 companies and top US
                  pharmaceutical firms. We spent years adapting it for independent healthcare practices.
                </p>

                <div
                  ref={s5GridRef}
                  className="mx-auto mt-6 grid w-full grid-cols-1 gap-3 text-left sm:mt-8 sm:gap-4 md:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-5"
                  style={{ opacity: 0 }}
                >
                  {WHO_WE_ARE_PILLARS.map((pillar, i) => (
                    <div
                      key={pillar.title}
                      ref={(el) => { s5CardRefs.current[i] = el }}
                      className="neon-pillar-card group pl-5 pr-4 py-4 will-change-[opacity,transform,filter] sm:pl-6 sm:pr-5 sm:py-5 md:pl-7 md:pr-6 md:py-6"
                      style={{ opacity: 0 }}
                    >
                      <span className="neon-pillar-accent" aria-hidden="true" />
                      <span className="neon-pillar-corner" aria-hidden="true" />
                      <span className="neon-pillar-index">{String(i + 1).padStart(2, '0')}</span>
                      <h3 className="neon-pillar-title relative mt-3 font-[Orbitron] text-[0.8125rem] font-bold leading-snug tracking-tight text-slate-100 sm:mt-4 sm:text-sm md:text-[0.95rem]">
                        {pillar.title}
                      </h3>
                      <p className="relative mt-2 text-[11px] leading-relaxed text-zinc-400 transition-colors duration-500 group-hover:text-zinc-300 sm:mt-2.5 sm:text-xs md:text-sm">
                        {pillar.desc}
                      </p>
                      <span className="neon-pillar-glow-line" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            ref={section6Ref}
            className="absolute inset-0 z-10 overflow-hidden bg-[#120F17]"
            style={{ opacity: 0 }}
          >
            <div ref={s6RaysWrapRef} className="absolute inset-0 will-change-[opacity,filter]" style={{ opacity: 0 }}>
              <LightRays
                raysOrigin="top-center"
                raysColor="#8a5cff"
                raysSpeed={1.2}
                lightSpread={0.78}
                rayLength={1.35}
                fadeDistance={1.1}
                saturation={0.92}
                followMouse
                mouseInfluence={0.08}
                noiseAmount={0.06}
                distortion={0.04}
                className="absolute inset-0"
              />
            </div>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 80% 75% at 50% 40%, rgba(18, 15, 23, 0.05), rgba(18, 15, 23, 0.72) 70%)',
              }}
            />

            <div className="relative z-10 flex h-full w-full items-center justify-center overflow-y-auto px-6 py-10 md:px-10">
              <div
                ref={s6FormRef}
                className="audit-form-card w-full max-w-[420px] will-change-[opacity,transform,filter]"
                style={{ opacity: 0 }}
              >
                <span className="audit-form-badge">FREE · NO OBLIGATION</span>

                <h2 className="audit-form-title font-[Orbitron] italic">Free Practice Audit</h2>

                <p className="audit-form-desc">
                  We&apos;ll review your digital presence, HIPAA compliance posture, IT
                  infrastructure, and marketing performance — and tell you exactly where you stand.
                </p>

                <ul className="audit-form-checklist">
                  {AUDIT_FEATURES.map((feature) => (
                    <li key={feature} className="audit-form-checklist-item">
                      <span className="audit-form-check" aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 6.2L4.8 9L10 3"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <form
                  className="audit-form-fields"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="text"
                    name="practiceName"
                    placeholder="Practice name"
                    className="audit-form-input"
                    autoComplete="organization"
                  />
                  <input
                    type="text"
                    name="yourName"
                    placeholder="Your name"
                    className="audit-form-input"
                    autoComplete="name"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    className="audit-form-input"
                    autoComplete="email"
                  />
                  <button type="submit" className="audit-form-submit group">
                    <span className="audit-form-submit-inner">
                      <span className="neon-cta-text font-[Orbitron] text-sm font-bold uppercase italic">
                        Claim your free audit →
                      </span>
                    </span>
                  </button>
                </form>

                <p className="audit-form-footnote">
                  Takes 30 seconds. Results delivered within 24 hours.
                </p>
              </div>
            </div>
          </section>

          <div
            ref={scrollHintRef}
            className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 will-change-[opacity]"
          >
            <span
              ref={scrollHintTextRef}
              className="font-[Orbitron] text-[10px] tracking-[0.3em] text-white/40 uppercase"
            >
              Scroll
            </span>
            <div className="h-8 w-px animate-pulse bg-gradient-to-b from-[#8a5cff]/60 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
