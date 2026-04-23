import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const COLORS = {
  iris: "#7C6FCD",
  lavender: "#B09EE8",
  mauve: "#C8A7D8",
  petal: "#F0E8F8",
  gold: "#C9A44A",
  warmGold: "#E8C97A",
  indigo: "#2A1F4E",
  white: "#FFFFFF",
  petalLight: "#FAF5FF",
  petalMid: "#EDE0F5",
};

const GRADIENT = `linear-gradient(135deg, #7C6FCD 0%, #9B8EDF 30%, #C8A7D8 65%, #D4A0C0 100%)`;

export function LandingPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif", minHeight: "100vh", background: COLORS.petalLight, color: COLORS.indigo }}>

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "92vh", display: "flex", alignItems: "center", padding: "0 6vw" }}>

        {/* Gradient orb background */}
        <div style={{ position: "absolute", inset: 0, background: GRADIENT, opacity: 0.07, zIndex: 0 }} />
        <div style={{ position: "absolute", top: -120, right: -100, width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${COLORS.lavender}40 0%, transparent 65%)`, zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: -80, left: -60, width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(circle, ${COLORS.mauve}30 0%, transparent 65%)`, zIndex: 0 }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ position: "relative", zIndex: 1, maxWidth: 680 }}
        >
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 999, background: `${COLORS.iris}18`, border: `1px solid ${COLORS.iris}35`, marginBottom: 28 }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.gold, display: "inline-block" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.iris, letterSpacing: "0.04em" }}>Made for Indian Women</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.65 }}
            style={{ fontSize: "clamp(36px, 5.5vw, 62px)", margin: 0, color: COLORS.indigo, lineHeight: 1.13, fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Aapke symptoms,{" "}
            <span style={{ background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              ab samjhe jaayenge.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42, duration: 0.6 }}
            style={{ fontSize: "clamp(16px, 1.8vw, 20px)", color: `${COLORS.indigo}99`, marginTop: 20, maxWidth: 540, lineHeight: 1.7 }}
          >
            Thyroid, Anemia, PCOS – Indian women health insights in one simple app.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ display: "flex", gap: 14, marginTop: 40, flexWrap: "wrap", alignItems: "center" }}
          >
            <Link to="/signup" style={ctaPrimary}>Get Started Free →</Link>
            <Link to="/login" style={ctaSecondary}>Login</Link>
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            style={{ display: "flex", gap: 32, marginTop: 52, flexWrap: "wrap" }}
          >
            {[["10K+", "Women Helped"], ["4", "Conditions Detected"], ["2 min", "Screening Time"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.iris }}>{n}</div>
                <div style={{ fontSize: 12, color: `${COLORS.indigo}70`, marginTop: 2, fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </motion.div> */}
        </motion.div>

        {/* Hero decorative card */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ position: "absolute", right: "6vw", top: "50%", transform: "translateY(-50%)", display: "none", zIndex: 1 }}
          className="hero-card"
        />
      </section>

      {/* ── VALUE PROPS ── */}
      <section style={{ padding: "100px 6vw", background: COLORS.white }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p variants={fadeInUp} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: COLORS.gold, textTransform: "uppercase", marginBottom: 12 }}>Why Niramaya</motion.p>
          <motion.h2 variants={fadeInUp} style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800, color: COLORS.indigo, margin: "0 0 52px", maxWidth: 500, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            Health clarity, the way you deserve it.
          </motion.h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { icon: "🧠", title: "Understand Your Body", desc: "Know exactly what your symptoms mean — in plain language." },
              { icon: "💡", title: "Clarity, Not Confusion", desc: "Simple explanations, no medical jargon." },
              { icon: "🎯", title: "Take Better Decisions", desc: "Know your next steps clearly, every time." },
              { icon: "💪", title: "Your Health, Your Control", desc: "Empower yourself with real knowledge." },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                style={{
                  padding: "32px 28px",
                  background: COLORS.petalLight,
                  borderRadius: 20,
                  border: `1px solid ${COLORS.mauve}50`,
                  cursor: "default",
                  transition: "box-shadow 0.25s",
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${COLORS.iris}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.indigo, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 14, color: `${COLORS.indigo}80`, lineHeight: 1.65 }}>{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── PROCESS STEPS ── */}
      <section style={{ padding: "100px 6vw", background: COLORS.petalLight, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -80, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${COLORS.lavender}20 0%, transparent 65%)` }} />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div
            variants={fadeInUp}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 999, background: `${COLORS.gold}18`, border: `1px solid ${COLORS.gold}40`, marginBottom: 24 }}
          >
            <span style={{ fontSize: 14 }}>⚡</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>Simple Process</span>
          </motion.div>

          <motion.h2 variants={fadeInUp} style={{ fontSize: "clamp(28px, 3.5vw, 44px)", color: COLORS.indigo, margin: "0 0 14px", fontWeight: 800, letterSpacing: "-0.02em", maxWidth: 560, lineHeight: 1.2 }}>
            4 aasaan steps mein apni health ka safar
          </motion.h2>
          <motion.p variants={fadeInUp} style={{ color: `${COLORS.indigo}70`, maxWidth: 520, fontSize: 16, lineHeight: 1.7, marginBottom: 52 }}>
            Koi medical jargon nahi. Koi confusion nahi. Bas simple, caring guidance.
          </motion.p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 22 }}>
            {[
              { n: 1, title: "Apne symptoms batao", body: "Jo bhi feel ho raha hai — thakaan, baal girna, irregular periods, mood changes.", icon: "📝" },
              { n: 2, title: "Follow-up questions", body: "Hum aapke answers ke basis par smart questions poochte hain. Jaise — kitne time se?", icon: "💬" },
              { n: 3, title: "Lab report add karo", body: "Agar lab hai to report upload karo. Isse prediction aur behtar hogi.", icon: "🧪" },
              { n: 4, title: "Download Your Health Report", body: "Ek clinical-style PDF jo aap doctor ke saath share kar sakte ho.", icon: "📄" },
            ].map((c) => (
              <motion.div
                key={c.n}
                variants={fadeInUp}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                style={{
                  borderRadius: 22,
                  padding: "36px 28px 28px",
                  background: COLORS.white,
                  border: `1px solid ${COLORS.mauve}40`,
                  position: "relative",
                }}
              >
                {/* Step number badge */}
                <div style={{
                  position: "absolute", top: -16, left: 26,
                  width: 34, height: 34, borderRadius: 10,
                  background: GRADIENT,
                  color: COLORS.white,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 15,
                  boxShadow: `0 4px 12px ${COLORS.iris}40`,
                }}>
                  {c.n}
                </div>
                <div style={{ fontSize: 30, marginBottom: 14 }}>{c.icon}</div>
                <h3 style={{ margin: "0 0 10px", color: COLORS.indigo, fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{c.title}</h3>
                <p style={{ color: `${COLORS.indigo}70`, margin: 0, lineHeight: 1.65, fontSize: 14 }}>{c.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CONDITIONS ── */}
      <section style={{ padding: "100px 6vw", background: COLORS.white }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.p variants={fadeInUp} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: COLORS.gold, textTransform: "uppercase", marginBottom: 12 }}>Detection Coverage</motion.p>
          <motion.h2 variants={fadeInUp} style={{ fontSize: "clamp(28px, 3.5vw, 44px)", color: COLORS.indigo, margin: "0 0 12px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Hum detect karte hain
          </motion.h2>
          <motion.p variants={fadeInUp} style={{ color: `${COLORS.indigo}70`, maxWidth: 520, marginBottom: 48, fontSize: 16, lineHeight: 1.7 }}>
            Ye conditions aapki symptoms ke basis par detect kiye jaate hain
          </motion.p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20 }}>
            {[
              { title: "Hypothyroidism", subtitle: "Thyroid gland ki kami se hormonal imbalance", symptoms: ["Constant thakaan", "Weight gain", "Cold intolerance"], accent: COLORS.iris },
              { title: "Iron Deficiency Anemia", subtitle: "Khoon mein iron ki kami", symptoms: ["Fatigue", "Pale skin", "Shortness of breath"], accent: COLORS.gold },
              { title: "PCOS", subtitle: "Polycystic Ovary Syndrome", symptoms: ["Irregular periods", "Weight changes", "Acne"], accent: COLORS.mauve },
              { title: "Hyperthyroidism", subtitle: "Thyroid overactivity", symptoms: ["Weight loss", "Rapid heartbeat", "Anxiety"], accent: COLORS.lavender },
            ].map((c, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ scale: 1.018, transition: { duration: 0.25 } }}
                style={{
                  borderRadius: 20,
                  padding: "28px 24px",
                  background: COLORS.petalLight,
                  border: `1px solid ${COLORS.mauve}45`,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Accent top bar */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: c.accent, borderRadius: "20px 20px 0 0" }} />
                <h3 style={{ margin: "12px 0 6px", fontSize: 19, fontWeight: 700, color: COLORS.indigo }}>{c.title}</h3>
                <p style={{ color: `${COLORS.indigo}65`, margin: "0 0 18px", fontSize: 13, lineHeight: 1.5 }}>{c.subtitle}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {c.symptoms.map((s, j) => (
                    <span key={j} style={{
                      padding: "5px 13px",
                      background: `${c.accent}18`,
                      border: `1px solid ${c.accent}35`,
                      borderRadius: 999,
                      fontSize: 12,
                      color: COLORS.indigo,
                      fontWeight: 500,
                    }}>{s}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeInUp}
            style={{ marginTop: 36, padding: "20px 24px", background: COLORS.petalMid, borderRadius: 14, border: `1px solid ${COLORS.mauve}50` }}
          >
            <p style={{ margin: 0, color: `${COLORS.indigo}80`, fontSize: 15, lineHeight: 1.7 }}>
              Aur bhi conditions detect hote hain jaise{" "}
              <strong style={{ color: COLORS.indigo }}>Endometriosis, Menorrhagia, Amenorrhea, Uterine Fibroids, PMDD, Perimenopause, Vitamin Deficiencies (B Complex, D, Magnesium, Zinc), Insulin Resistance,</strong>{" "}
              aur bahut saare...
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── WHY CHOOSE ── */}
      <section style={{ padding: "100px 6vw", background: COLORS.petalLight }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p variants={fadeInUp} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: COLORS.gold, textTransform: "uppercase", marginBottom: 12 }}>Our Promise</motion.p>
          <motion.h2 variants={fadeInUp} style={{ fontSize: "clamp(28px, 3.5vw, 44px)", color: COLORS.indigo, margin: "0 0 48px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Kyun choose karein?
          </motion.h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { icon: "📊", title: "Track", desc: "Apni health ko time par track karein" },
              { icon: "🧠", title: "Understand", desc: "Apne symptoms ko clearly samjhein" },
              { icon: "💪", title: "Improve", desc: "Right guidance se behtar feel karein" },
              { icon: "🔒", title: "100% Private", desc: "Aapka data humare paas surakshit hai" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                style={{ padding: "28px 24px", background: COLORS.white, borderRadius: 18, border: `1px solid ${COLORS.mauve}40`, textAlign: "center" }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 16, background: GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>{item.icon}</div>
                <h4 style={{ margin: "0 0 8px", color: COLORS.indigo, fontSize: 17, fontWeight: 700 }}>{item.title}</h4>
                <p style={{ color: `${COLORS.indigo}70`, margin: 0, fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "100px 6vw", position: "relative", overflow: "hidden", background: COLORS.indigo }}>
        <div style={{ position: "absolute", inset: 0, background: GRADIENT, opacity: 0.25 }} />
        <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${COLORS.lavender}30 0%, transparent 65%)` }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          style={{ position: "relative", zIndex: 1, maxWidth: 580 }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 999, background: `${COLORS.white}15`, border: `1px solid ${COLORS.white}25`, marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.warmGold, display: "inline-block" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.warmGold, letterSpacing: "0.06em" }}>Free • No credit card</span>
          </div>

          <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", color: COLORS.white, margin: "0 0 16px", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            Ab shuru karein?
          </h2>
          <p style={{ color: `${COLORS.white}80`, maxWidth: 460, marginBottom: 40, fontSize: 17, lineHeight: 1.7 }}>
            Bas 2 minute lagega. Koi credit card nahi, koi commitment nahi.
          </p>
          <Link to="/signup" style={ctaGold}>Start Free Screening Now →</Link>
        </motion.div>
      </section>
    </div>
  );
}

const ctaPrimary = {
  padding: "15px 34px",
  borderRadius: 999,
  background: `linear-gradient(135deg, #7C6FCD, #9B8EDF)`,
  color: "#FFFFFF",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 16,
  display: "inline-block",
  boxShadow: "0 6px 20px rgba(124,111,205,0.38)",
  transition: "transform 0.2s, box-shadow 0.2s",
  letterSpacing: "-0.01em",
};

const ctaSecondary = {
  padding: "15px 34px",
  borderRadius: 999,
  background: "transparent",
  color: "#7C6FCD",
  border: "1.5px solid #7C6FCD",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 16,
  display: "inline-block",
  letterSpacing: "-0.01em",
};

const ctaGold = {
  padding: "16px 36px",
  borderRadius: 999,
  background: `linear-gradient(135deg, #C9A44A, #E8C97A)`,
  color: "#2A1F4E",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 16,
  display: "inline-block",
  boxShadow: "0 6px 22px rgba(201,164,74,0.4)",
  letterSpacing: "-0.01em",
};