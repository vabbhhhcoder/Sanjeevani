import { Lang } from './types';

export const LANGS: { code: Lang; name: string; native: string; fontClass: string }[] = [
  { code: 'en', name: 'English', native: 'English', fontClass: '' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', fontClass: 'font-deva' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', fontClass: 'font-deva' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', fontClass: 'font-tamil' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', fontClass: 'font-telugu' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', fontClass: 'font-bengali' },
];

type Dict = Record<string, string>;
const en: Dict = {
  welcome: 'You are safe here.',
  subtitle: 'This is a private space. Take your time. Nothing here is shared without your permission.',
  checkin: 'Daily Check-in',
  voiceJournal: 'Voice Journal',
  companion: 'Safe Harbor Companion',
  sos: 'I need help now',
  relief: 'Relief & Legal Aid',
  sleep: 'How did you sleep?',
  safety: 'How safe do you feel today?',
  weight: 'How heavy does today feel?',
  submit: 'Save my check-in',
  quickExit: 'Quick Exit',
  startRecording: 'Hold to speak',
  recording: 'Listening… tap to finish',
  quote: 'Healing is not linear. Every small step counts.',
  language: 'Language',
  consentTitle: 'Your data, your choice',
};
const hi: Dict = {
  welcome: 'आप यहाँ सुरक्षित हैं।',
  subtitle: 'यह एक निजी स्थान है। अपना समय लें। आपकी अनुमति के बिना यहाँ कुछ भी साझा नहीं किया जाता।',
  checkin: 'दैनिक जाँच',
  voiceJournal: 'आवाज़ डायरी',
  companion: 'सुरक्षित साथी',
  sos: 'मुझे अभी मदद चाहिए',
  relief: 'राहत और कानूनी सहायता',
  sleep: 'आपकी नींद कैसी रही?',
  safety: 'आज आप कितना सुरक्षित महसूस कर रहे हैं?',
  weight: 'आज का दिन कितना भारी लग रहा है?',
  submit: 'मेरी जाँच सहेजें',
  quickExit: 'तुरंत बाहर',
  startRecording: 'बोलने के लिए दबाएँ',
  recording: 'सुन रहे हैं… समाप्त करने के लिए टैप करें',
  quote: 'उपचार सीधी रेखा में नहीं होता। हर छोटा कदम मायने रखता है।',
  language: 'भाषा',
  consentTitle: 'आपका डेटा, आपकी पसंद',
};
const mr: Dict = { ...hi, welcome: 'तुम्ही इथे सुरक्षित आहात.', subtitle: 'ही एक खाजगी जागा आहे. तुमचा वेळ घ्या. तुमच्या परवानगीशिवाय काहीही शेअर केले जात नाही.', checkin: 'दैनिक तपासणी', voiceJournal: 'आवाज डायरी', companion: 'सुरक्षित सोबती', sos: 'मला आत्ता मदत हवी आहे', relief: 'मदत आणि कायदेशीर सहाय्य', sleep: 'तुमची झोप कशी झाली?', safety: 'आज तुम्हाला किती सुरक्षित वाटते?', weight: 'आजचा दिवस किती जड वाटतो?', submit: 'माझी तपासणी जतन करा', quickExit: 'त्वरित बाहेर', quote: 'बरे होणे सरळ रेषेत नसते. प्रत्येक लहान पाऊल महत्त्वाचे आहे.', language: 'भाषा' };
const ta: Dict = { ...en, welcome: 'நீங்கள் இங்கே பாதுகாப்பாக இருக்கிறீர்கள்.', subtitle: 'இது ஒரு தனிப்பட்ட இடம். உங்கள் நேரத்தை எடுத்துக் கொள்ளுங்கள்.', checkin: 'தினசரி சோதனை', voiceJournal: 'குரல் நாட்குறிப்பு', companion: 'பாதுகாப்பான துணை', sos: 'எனக்கு இப்போது உதவி வேண்டும்', relief: 'நிவாரணம் & சட்ட உதவி', sleep: 'உங்கள் தூக்கம் எப்படி இருந்தது?', safety: 'இன்று எவ்வளவு பாதுகாப்பாக உணர்கிறீர்கள்?', weight: 'இன்று எவ்வளவு கனமாக உணர்கிறீர்கள்?', submit: 'சேமிக்கவும்', quickExit: 'விரைவு வெளியேறு', quote: 'குணமடைதல் நேர்கோடு அல்ல. ஒவ்வொரு சிறிய படியும் முக்கியம்.', language: 'மொழி' };
const te: Dict = { ...en, welcome: 'మీరు ఇక్కడ సురక్షితంగా ఉన్నారు.', subtitle: 'ఇది ఒక ప్రైవేట్ స్థలం. మీ సమయం తీసుకోండి.', checkin: 'రోజువారీ తనిఖీ', voiceJournal: 'వాయిస్ డైరీ', companion: 'సురక్షిత సహచరుడు', sos: 'నాకు ఇప్పుడు సహాయం కావాలి', relief: 'ఉపశమనం & న్యాయ సహాయం', sleep: 'మీ నిద్ర ఎలా ఉంది?', safety: 'ఈ రోజు మీరు ఎంత సురక్షితంగా భావిస్తున్నారు?', weight: 'ఈ రోజు ఎంత భారంగా అనిపిస్తుంది?', submit: 'సేవ్ చేయండి', quickExit: 'త్వరిత నిష్క్రమణ', quote: 'స్వస్థత సరళరేఖ కాదు. ప్రతి చిన్న అడుగు ముఖ్యం.', language: 'భాష' };
const bn: Dict = { ...en, welcome: 'আপনি এখানে নিরাপদ।', subtitle: 'এটি একটি ব্যক্তিগত স্থান। আপনার সময় নিন।', checkin: 'দৈনিক চেক-ইন', voiceJournal: 'ভয়েস ডায়েরি', companion: 'নিরাপদ সঙ্গী', sos: 'আমার এখনই সাহায্য দরকার', relief: 'ত্রাণ ও আইনি সহায়তা', sleep: 'আপনার ঘুম কেমন হয়েছে?', safety: 'আজ আপনি কতটা নিরাপদ বোধ করছেন?', weight: 'আজ কতটা ভারী লাগছে?', submit: 'সংরক্ষণ করুন', quickExit: 'দ্রুত প্রস্থান', quote: 'সুস্থতা সরলরেখা নয়। প্রতিটি ছোট পদক্ষেপ গুরুত্বপূর্ণ।', language: 'ভাষা' };

const dicts: Record<Lang, Dict> = { en, hi, mr, ta, te, bn };
export function t(lang: Lang, key: string): string {
  return dicts[lang]?.[key] ?? en[key] ?? key;
}
