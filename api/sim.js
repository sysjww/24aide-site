// TeXML step server for 24aide live-call simulations.
// GET /api/sim?s=<scenario>&step=<n>
// step 0: record the AI greeting, then go to step 1
// step k (1..N): say caller line k, record the AI reply, then go to step k+1
// step N+1: hang up
// One <Record> per document: verbs after a <Record> are unreachable, so each
// step is its own document, fetched via the Record's action URL (method GET).

const SCENARIOS = {
  s1: { voice: "Polly.Matthew", lines: [
    "Hi, I saw your ad. I run a plumbing company in Dallas, and I keep missing calls while my crew is out on jobs. Can you tell me how this works?",
    "I'm Mike Dawson, Mike's Plumbing. There are three of us.",
    "About 150 a month. I'd say we miss 30 or 40, mostly when we're all out on jobs.",
    "Depends, but an average job is maybe $400, $500.",
    "Yeah, that's it. People call, nobody answers, they call the next plumber. I can't be on a roof and on the phone at the same time.",
    "Booking would be great, if it actually works. Honestly, I'm a little skeptical. Does it sound like a robot? My customers would hang up.",
    "Maybe. What does it cost?",
    "$149 a month. That's not nothing. I need to think about it.",
    "What about the free trial? Do I need a credit card for that?",
    "Okay. Can I try a demo call this week?",
    "Email is mike@mikesplumbing.com. My mobile is 214-555-0147."
  ]},
  s2: { voice: "Polly.Joey", lines: [
    "Hi, I run an HVAC company in Denver. Quick question. Do you guys connect with Jobber? I need bookings to go straight onto my schedule.",
    "Sure. David Chen, Peak Air Heating and Cooling. Five techs.",
    "Around 300. And honestly, we miss a lot of them after hours and on weekends.",
    "We have an answering service, but they just take a message. Half the time the customer already called someone else by morning.",
    "Yeah, that's a big one. In winter, a no-heat call can't wait until morning. We lose those jobs to whoever picks up first.",
    "So if a furnace dies at 2 AM, the AI calls me?",
    "Hmm. $249 is more than I pay the answering service now.",
    "Honestly, both. Winter's coming, and the urgent calls are the expensive ones.",
    "Yeah, send it over. What do you need from me?",
    "david@peakair.com. Mobile is 303-555-0182."
  ]},
  s3: { voice: "Polly.Justin", lines: [
    "Hi, I'm a one-man electrician out in Phoenix. What's your cheapest plan?",
    "Tom Reyes. It's just me, no office staff. I get maybe 80 calls a month.",
    "Me or my wife, when she can. But I'm up a ladder half the day, and she's got her own job. We miss plenty.",
    "Nah, just answering and texting back. Hey, how many texts do I get on the Starter plan?",
    "Hmm, okay. What if I go over the minutes?",
    "And if I pay for a year up front, is it cheaper?",
    "So how much is that for the year, exactly?",
    "Look, $49 a month. I'm a small shop. Is it really worth it for a one-man operation?",
    "A service call is $150, $200. A panel job is a lot more.",
    "Yeah, okay. Send it to tom@reyeselectric.com."
  ]},
  s4: { voice: "Polly.Joanna", lines: [
    "Hi, my kitchen sink is leaking. Can I book someone to come fix it today?",
    "Oh, I thought this was a plumber. Well, can you at least tell me who to call?",
    "Okay, fine. I'm Sarah Kim. My number is 214-555-0132. The sink is leaking underneath the kitchen.",
    "Dallas, near Lakewood.",
    "Wait. Actually, my husband runs a small plumbing business. Is this something for him?",
    "Yeah, sure. His email is dan@kim-plumbing.com."
  ]},
  s5: { voice: "Polly.Matthew", lines: [
    "There's water everywhere! A pipe burst in my house and it's flooding. I need someone right now!",
    "I don't want a robot! Let me talk to a real person!",
    "James Park. 469-555-0176. Dallas.",
    "No, nobody's hurt. But the water's coming up fast.",
    "Yes. In the laundry room."
  ]}
};

const BASE = "https://24aide.com/api/sim";

function esc(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

module.exports = (req, res) => {
  const s = req.query.s;
  const step = parseInt(req.query.step || "0", 10);
  const sc = SCENARIOS[s];
  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  if (!sc || isNaN(step) || step < 0) {
    res.status(400).send('<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Hangup/>\n</Response>\n');
    return;
  }
  const lines = sc.lines;
  let body;
  if (step === 0) {
    body = '<Response>\n  <Record action="' + BASE + '?s=' + s + '&amp;step=1" method="GET" timeout="5" maxLength="30" playBeep="false" trim="trim-silence"/>\n</Response>';
  } else if (step >= 1 && step <= lines.length) {
    const line = esc(lines[step - 1]);
    body = '<Response>\n  <Say voice="' + sc.voice + '">' + line + '</Say>\n  <Record action="' + BASE + '?s=' + s + '&amp;step=' + (step + 1) + '" method="GET" timeout="5" maxLength="90" playBeep="false" trim="trim-silence"/>\n</Response>';
  } else {
    body = '<Response>\n  <Hangup/>\n</Response>';
  }
  res.status(200).send('<?xml version="1.0" encoding="UTF-8"?>\n' + body + '\n');
};
