'use client'

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"

import './Assets/Home.css'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Section → nav label mapping
const NAV_SECTIONS = [
  { id: 'hero', label: 'Home', prop:"home" },
  { id: 'about', label: 'About' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'process', label: 'Process' },
  { id: 'applications', label: 'Applications' },
  { id: 'benefits', label: 'Benefits' },
  { id: 'contact', label: 'Contact' },
]

function Home() {
  const mainRef = useRef(null)
  const lenisRef = useRef(null)
  const spyLockRef = useRef(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [openFaq, setOpenFaq] = useState(null)

  // Reads the real navbar height at call-time — works on both desktop & mobile
  const navOffset = () => -(document.querySelector('.nav')?.offsetHeight ?? 10)

  // ============ PAGE LOADER ============
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const pct = { val: 0 }
    const tl = gsap.timeline()
    tl
      .fromTo('#__loader__ .loader_logo',
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      )
      .fromTo('#__loader__ .loader_tagline',
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo('#__loader__ .loader_bar_inner',
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1.5, ease: 'power2.inOut' },
        '-=0.3'
      )
      .add(() => {
        gsap.to(pct, {
          val: 100, duration: 1.5, ease: 'power2.inOut',
          onUpdate: () => {
            const el = document.querySelector('#__loader__ .loader_percent')
            if (el) el.textContent = Math.round(pct.val) + '%'
          }
        })
      }, '<')
      .to('#__loader__', { yPercent: -100, duration: 0.9, ease: 'power4.inOut', delay: 0.3 })
      .call(() => {
        document.body.style.overflow = ''
        document.getElementById('__loader__')?.remove()
      })
    return () => tl.kill()
  }, [])

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    // ============ LENIS ULTRA-SMOOTH SCROLL ============
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => 1 - Math.pow(1 - t, 5),   // quint ease-out — long, buttery deceleration
      lerp: 0.06,                                // low lerp = silkier interpolation
      smoothWheel: true,
      smoothTouch: true,                         // smooth scroll on touch devices too
      wheelMultiplier: 1.2,                      // slightly amplified wheel for responsiveness
      touchMultiplier: 1.8,                      // comfortable touch momentum
    })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    // ============ SCROLL SPY — Lenis scroll event (zero dead zones) ============
    // Section activates as soon as its top enters the top ~30% of the viewport
    // (just below the nav). When a nav link is clicked, the handler sets
    // spyLockRef so the spy doesn't overwrite the clicked section's active
    // state while the programmatic smooth-scroll is animating.
    const updateSpy = ({ scroll }) => {
      if (spyLockRef.current) return
      const navH = document.querySelector('.nav')?.offsetHeight ?? 1
      const triggerOffset = navH + window.innerHeight * 0.3
      let current = NAV_SECTIONS[0].id
      NAV_SECTIONS.forEach(({ id }) => {
        const sec = document.getElementById(id)
        if (!sec) return
        const sectionTop = sec.getBoundingClientRect().top + scroll
        if (scroll + triggerOffset >= sectionTop) {
          current = id
        }
      })
      setActiveSection(current)
    }
    lenis.on('scroll', updateSpy)
    // Fire once on mount so hero is immediately active
    updateSpy({ scroll: 0 })

    // Hide elements before animating
    gsap.set(el.querySelectorAll('.big_text, .small_text, .items p, .hero_button button'), { autoAlpha: 0 })
    gsap.set(el.querySelectorAll('.center h2, .center p, .what_we_do > p, .what_we, .dialoge > p:first-child, .dialoge > p:nth-child(2), .dialoge > div > div > div, .line > p, .rounded, .weserve > p, .serve_flex > div, .why_title, .why_card, .faq_tag, .faq_title, .faq_item, .cta_title, .cta_buttons, .footer_col, .footer_bottom'), { autoAlpha: 0 })

    const ctx = gsap.context(() => {

      // ============ HERO ENTRANCE ============
      gsap.set(".big_text", { y: 60 })
      gsap.set(".small_text", { y: 40 })
      gsap.set(".items p", { y: 30 })
      gsap.set(".hero_button button", { y: 20 })

      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.2 })
      heroTl
        .to(".big_text", { autoAlpha: 1, y: 0, duration: 1 })
        .to(".small_text", { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.5")
        .to(".items p", { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.15 }, "-=0.4")
        .to(".hero_button button", { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.2 }, "-=0.3")

      // ============ HERO PARALLAX FADE ON SCROLL ============
      gsap.to(".hero-inner", {
        y: -80,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "60% top",
          end: "bottom top",
          scrub: true
        }
      })

      // ============ ABOUT VIDEO PARALLAX ============
      gsap.fromTo(".about_vid video",
        { scale: 0.88, autoAlpha: 0, y: 60 },
        {
          scale: 1, autoAlpha: 1, y: 0, duration: 1.4, ease: "power2.out",
          scrollTrigger: { trigger: ".about", start: "top 80%", toggleActions: "play none none reverse" }
        }
      )
      gsap.to(".about_vid video", {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: ".about",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      })

      // ============ ABOUT TEXT ============
      gsap.fromTo(".center h2",
        { autoAlpha: 0, y: 50, scale: 0.95 },
        {
          autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "power2.out",
          scrollTrigger: { trigger: ".center", start: "top 80%", toggleActions: "play none none reverse" }
        }
      )
      gsap.fromTo(".center p",
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.25, ease: "power2.out",
          scrollTrigger: { trigger: ".center", start: "top 75%", toggleActions: "play none none reverse" }
        }
      )

      // ============ WHAT WE DO — TITLE ============
      gsap.fromTo(".what_we_do > p",
        { autoAlpha: 0, y: 50, scale: 0.9 },
        {
          autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.4)",
          scrollTrigger: { trigger: ".what_we_do", start: "top 80%", toggleActions: "play none none reverse" }
        }
      )

      // ============ WHAT WE DO — CARDS STAGGER FROM BOTTOM WITH ROTATION ============
      gsap.fromTo(".what_we",
        { autoAlpha: 0, y: 70, rotationX: 15 },
        {
          autoAlpha: 1, y: 0, rotationX: 0, duration: 0.8, stagger: 0.18, ease: "power3.out", clearProps: "transform",
          scrollTrigger: { trigger: ".we_flex", start: "top 85%", toggleActions: "play none none reverse" }
        }
      )

      // ============ INFRASTRUCTURE HEADING ============
      gsap.fromTo(".dialoge > p:first-child",
        { autoAlpha: 0, y: 40, letterSpacing: "8px" },
        {
          autoAlpha: 1, y: 0, letterSpacing: "0px", duration: 1, ease: "power2.out",
          scrollTrigger: { trigger: ".advance_infra", start: "top 80%", toggleActions: "play none none reverse" }
        }
      )
      gsap.fromTo(".dialoge > p:nth-child(2)",
        { autoAlpha: 0, y: 25 },
        {
          autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: ".advance_infra", start: "top 75%", toggleActions: "play none none reverse" }
        }
      )

      // ============ INFRASTRUCTURE CARDS — SCALE + FADE ============
      gsap.fromTo(".dialoge > div > div > div",
        { autoAlpha: 0, scale: 0.8, y: 40 },
        {
          autoAlpha: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "back.out(1.5)", clearProps: "transform",
          scrollTrigger: { trigger: ".dialoge > div", start: "top 80%", toggleActions: "play none none reverse" }
        }
      )

      // ============ IDEA VIDEO PARALLAX ============
      gsap.to(".idea_vid video", {
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: ".market",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      })

      // ============ TIMELINE HEADING ============
      gsap.fromTo(".line > p",
        { autoAlpha: 0, y: 40, scale: 0.95 },
        {
          autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "power2.out",
          scrollTrigger: { trigger: ".line", start: "top 80%", toggleActions: "play none none reverse" }
        }
      )

      // ============ TIMELINE CIRCLES — POP IN ============
      gsap.fromTo(".rounded",
        { autoAlpha: 0, scale: 0, rotation: -180 },
        {
          autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, stagger: 0.12, ease: "back.out(2)", clearProps: "transform",
          scrollTrigger: { trigger: ".line > div", start: "top 80%", toggleActions: "play none none reverse" }
        }
      )

      // ============ TIMELINE HR LINE DRAW ============
      gsap.fromTo(".market .line hr",
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1, duration: 1.2, ease: "power2.inOut",
          scrollTrigger: { trigger: ".line > div", start: "top 80%", toggleActions: "play none none reverse" }
        }
      )

      // ============ INDUSTRIES TITLE ============
      gsap.fromTo(".weserve > p",
        { autoAlpha: 0, y: 50, scale: 0.9 },
        {
          autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.4)",
          scrollTrigger: { trigger: ".weserve", start: "top 80%", toggleActions: "play none none reverse" }
        }
      )

      // ============ INDUSTRIES CARDS — ALTERNATE LEFT/RIGHT ============
      const serveCards = el.querySelectorAll(".serve_flex > div")
      serveCards.forEach((card, i) => {
        gsap.fromTo(card,
          { autoAlpha: 0, x: i % 2 === 0 ? -60 : 60 },
          {
            autoAlpha: 1, x: 0, duration: 0.7, ease: "power2.out", clearProps: "transform",
            scrollTrigger: { trigger: card, start: "top 90%", toggleActions: "play none none reverse" }
          }
        )
      })

      // ============ WHY CHOOSE US TITLE ============
      gsap.fromTo(".why_title",
        { autoAlpha: 0, y: 50, scale: 0.9 },
        {
          autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.4)",
          scrollTrigger: { trigger: ".us", start: "top 80%", toggleActions: "play none none reverse" }
        }
      )

      // ============ WHY CARDS — ICON SPIN + FADE UP ============
      const whyCards = el.querySelectorAll(".why_card")
      whyCards.forEach((card, i) => {
        const icon = card.querySelector(".why_ic")
        gsap.fromTo(card,
          { autoAlpha: 0, y: 60 },
          {
            autoAlpha: 1, y: 0, duration: 0.7, delay: i * 0.1, ease: "power2.out", clearProps: "transform",
            scrollTrigger: { trigger: ".why_grid", start: "top 85%", toggleActions: "play none none reverse" }
          }
        )
        if (icon) {
          gsap.fromTo(icon,
            { rotation: -90, scale: 0.5 },
            {
              rotation: 0, scale: 1, duration: 0.8, delay: i * 0.1, ease: "back.out(1.7)",
              scrollTrigger: { trigger: ".why_grid", start: "top 85%", toggleActions: "play none none reverse" }
            }
          )
        }
      })

      // ============ VID SECTION PARALLAX ============
      gsap.to(".vid_section video", {
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: ".vid_section",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      })

      // ============ FAQ ============
      gsap.fromTo(".faq_tag",
        { autoAlpha: 0, y: 20, letterSpacing: "6px" },
        {
          autoAlpha: 1, y: 0, letterSpacing: "1.2px", duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: ".faq", start: "top 80%", toggleActions: "play none none reverse" }
        }
      )
      gsap.fromTo(".faq_title",
        { autoAlpha: 0, y: 30, scale: 0.95 },
        {
          autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: ".faq", start: "top 78%", toggleActions: "play none none reverse" }
        }
      )
      const faqItems = el.querySelectorAll(".faq_item")
      faqItems.forEach((item, i) => {
        gsap.fromTo(item,
          { autoAlpha: 0, x: -50, rotationY: -10 },
          {
            autoAlpha: 1, x: 0, rotationY: 0, duration: 0.6, delay: i * 0.1, ease: "power2.out", clearProps: "transform",
            scrollTrigger: { trigger: ".faq_list", start: "top 85%", toggleActions: "play none none reverse" }
          }
        )
      })

      // ============ CTA — SCALE UP FROM CENTER ============
      gsap.fromTo(".cta_title",
        { autoAlpha: 0, scale: 0.85, y: 30 },
        {
          autoAlpha: 1, scale: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: ".cta", start: "top 80%", toggleActions: "play none none reverse" }
        }
      )
      gsap.fromTo(".cta_buttons",
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: ".cta", start: "top 75%", toggleActions: "play none none reverse" }
        }
      )
      // CTA button glow pulse after reveal
      gsap.fromTo(".cta_primary",
        { boxShadow: "0 0 20px rgba(0,212,255,0.3)" },
        {
          boxShadow: "0 0 40px rgba(0,212,255,0.6), 0 0 80px rgba(0,212,255,0.2)", duration: 1.5, repeat: -1, yoyo: true, ease: "sine.inOut",
          scrollTrigger: { trigger: ".cta", start: "top 70%", toggleActions: "play pause resume pause" }
        }
      )

      // ============ FOOTER BOUNCE ============
      gsap.fromTo(".footer_col",
        { autoAlpha: 0, y: 80 },
        {
          autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.2, ease: "bounce.out",
          scrollTrigger: { trigger: ".footer", start: "top 90%", toggleActions: "play none none reverse" }
        }
      )
      gsap.fromTo(".footer_bottom",
        { autoAlpha: 0 },
        {
          autoAlpha: 1, duration: 0.8, delay: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: ".footer", start: "top 90%", toggleActions: "play none none reverse" }
        }
      )

      // ============ NAVBAR SCRUB — darkens as hero scrolls away ============
      gsap.to('.nav', {
        background: 'rgba(5, 8, 25, 0.97)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.95), 0 0 80px rgba(0,212,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04)',
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '50% top',
          scrub: true,
        }
      })

      // ============ CLIP-PATH CURTAIN REVEALS (NEW — no conflict) ============
      const curtainSections = [
        { el: '.what_we_do', start: 'top 85%' },
        { el: '.advance_infra', start: 'top 85%' },
        { el: '.serve',        start: 'top 85%' },
        { el: '.us',           start: 'top 85%' },
      ]
      curtainSections.forEach(({ el: sel, start }) => {
        gsap.fromTo(sel,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.1, ease: 'power4.out',
            scrollTrigger: { trigger: sel, start, toggleActions: 'play none none reverse' }
          }
        )
      })

      // ============ FOOTER HEADINGS SLIDE IN ============
      gsap.fromTo('.footer_head',
        { autoAlpha: 0, x: -30 },
        {
          autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: '.footer', start: 'top 90%', toggleActions: 'play none none reverse' }
        }
      )

      // ============ FOOTER CONTACT ROWS SLIDE IN ============
      gsap.fromTo('.footer_contact_row',
        { autoAlpha: 0, x: -40 },
        {
          autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: '.footer_contact', start: 'top 92%', toggleActions: 'play none none reverse' }
        }
      )

      // ============ FOOTER ABOUT PARA FADE ============
      gsap.fromTo('.footer_about p',
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: '.footer_about', start: 'top 92%', toggleActions: 'play none none reverse' }
        }
      )

      // ============ SERVE ICONS — ELASTIC POP IN ============
      gsap.fromTo('.serve_icon',
        { autoAlpha: 0, scale: 0, rotation: -30 },
        {
          autoAlpha: 1, scale: 1, rotation: 0,
          duration: 0.7, stagger: 0.1, ease: 'back.out(2)',
          scrollTrigger: { trigger: '.serve_flex', start: 'top 88%', toggleActions: 'play none none reverse' }
        }
      )

      // ============ WHY CARDS — ICON GLOW PULSE (after reveal) ============
      gsap.fromTo('.why_ic',
        { filter: 'drop-shadow(0 0 0px rgba(0,212,255,0))' },
        {
          filter: 'drop-shadow(0 0 12px rgba(0,212,255,0.6))',
          duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut',
          scrollTrigger: { trigger: '.why_grid', start: 'top 80%', toggleActions: 'play pause resume pause' }
        }
      )

    }, el)

    // ============ SCROLL PROGRESS BAR ============
    const progressBar = document.createElement('div')
    progressBar.id = '__scroll_progress__'
    progressBar.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'height:3px', 'width:0%',
      'background:linear-gradient(90deg,#00d4ff,#7b5eed,#00d4ff)',
      'background-size:200% auto',
      'z-index:9999', 'pointer-events:none',
      'box-shadow:0 0 12px rgba(0,212,255,0.8)',
      'border-radius:0 2px 2px 0',
      'transform-origin:left center',
    ].join(';')
    document.body.appendChild(progressBar)

    gsap.to(progressBar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 0.3 }
    })
    gsap.to(progressBar, {
      backgroundPosition: '200% center',
      duration: 3, repeat: -1, ease: 'none',
    })

    // ============ CURSOR PERSPECTIVE TILT ON VIDEOS ============
    const tiltCleanups = []
    const aboutVid = el.querySelector('.about_vid')
    const vidSection = el.querySelector('.vid_section')
    const ideaVid = el.querySelector('.idea_vid')
    const containers = [aboutVid, vidSection, ideaVid].filter(Boolean)

    containers.forEach(container => {
      const video = container.querySelector('video')
      if (!video) return

      const handleMove = (e) => {
        const rect = container.getBoundingClientRect()
        const xPos = (e.clientX - rect.left) / rect.width - 0.5
        const yPos = (e.clientY - rect.top) / rect.height - 0.5
        gsap.to(video, {
          rotateY: xPos * 20,
          rotateX: -yPos * 20,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto"
        })
      }
      const handleLeave = () => {
        gsap.to(video, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power2.out" })
      }

      container.addEventListener('mousemove', handleMove)
      container.addEventListener('mouseleave', handleLeave)
      tiltCleanups.push(() => {
        container.removeEventListener('mousemove', handleMove)
        container.removeEventListener('mouseleave', handleLeave)
      })
    })

    // ============ 3D TILT ON CAPABILITY CARDS ============
    const wwCards = el.querySelectorAll('.what_we')
    wwCards.forEach(card => {
      card.style.transformStyle = 'preserve-3d'
      const onMove = (e) => {
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        gsap.to(card, { rotateY: x * 18, rotateX: -y * 18, scale: 1.04, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
      }
      const onLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' })
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
      tiltCleanups.push(() => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave) })
    })

    // ============ 3D TILT ON INFRA CARDS ============
    const infraCards = el.querySelectorAll('.dialoge > div > div > div')
    infraCards.forEach(card => {
      card.style.transformStyle = 'preserve-3d'
      const onMove = (e) => {
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        gsap.to(card, { rotateY: x * 14, rotateX: -y * 14, scale: 1.05, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
      }
      const onLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
      tiltCleanups.push(() => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave) })
    })

    // ============ MAGNETIC BUTTONS ============
    const magneticBtns = el.querySelectorAll('.hero_button button, .cta_primary, .cta_secondary')
    magneticBtns.forEach(btn => {
      const onMove = (e) => {
        const r = btn.getBoundingClientRect()
        const x = (e.clientX - r.left - r.width / 2) * 0.38
        const y = (e.clientY - r.top - r.height / 2) * 0.38
        gsap.to(btn, { x, y, duration: 0.4, ease: 'power2.out' })
      }
      const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' })
      btn.addEventListener('mousemove', onMove)
      btn.addEventListener('mouseleave', onLeave)
      tiltCleanups.push(() => { btn.removeEventListener('mousemove', onMove); btn.removeEventListener('mouseleave', onLeave) })
    })

    // ============ NEON MOUSE FOLLOWER + SPARKLE TRAIL (desktop/pointer only) ============
    // Skip entirely on touch/mobile devices
    const isPointerDevice = window.matchMedia('(pointer: fine)').matches
    let sparkLoop = null, onCursorMove = null, resizeSpark = null

    if (isPointerDevice) {
    // Canvas for sparks
    const sparkCanvas = document.createElement('canvas')
    sparkCanvas.id = '__sparkle_canvas__'
    sparkCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99997;'
    document.body.appendChild(sparkCanvas)

    // Cursor neon dot
    const cursorDot = document.createElement('div')
    cursorDot.id = '__cursor_dot__'
    cursorDot.style.cssText = [
      'position:fixed', 'width:13px', 'height:13px', 'border-radius:50%',
      'background:#00d4ff', 'pointer-events:none', 'z-index:99999',
      'top:0', 'left:0', 'transform:translate(-50%,-50%)',
      'box-shadow:0 0 10px #00d4ff,0 0 24px #00d4ff,0 0 45px rgba(0,212,255,0.55)',
      'mix-blend-mode:screen',
    ].join(';')
    document.body.appendChild(cursorDot)

    // Resize canvas to fill viewport
    const sparkCtx = sparkCanvas.getContext('2d')
    const resizeSpark = () => { sparkCanvas.width = window.innerWidth; sparkCanvas.height = window.innerHeight }
    resizeSpark()
    window.addEventListener('resize', resizeSpark)

    // Spark colors matching site palette
    const SPARK_COLORS = ['#00d4ff', '#7b5eed', '#38bdf8', '#a78bfa', '#00ffee', '#60a5fa']
    const sparks = []

    class Spark {
      constructor(x, y, dx, dy) {
        const speed = Math.sqrt(dx * dx + dy * dy) || 1
        this.x = x; this.y = y
        this.vx = dx * 0.5 + (Math.random() - 0.5) * 2.5
        this.vy = dy * 0.5 + (Math.random() - 0.5) * 2.5
        this.life = 1
        this.decay = 0.022 + Math.random() * 0.04
        this.size = 0.6 + Math.random() * 2.2
        this.color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]
        this.isLine = Math.random() > 0.35
        this.angle = Math.atan2(dy, dx)
        this.lineLen = 4 + Math.random() * 12
        this.glow = Math.random() > 0.5
      }
      update() {
        this.x += this.vx; this.y += this.vy
        this.vx *= 0.93; this.vy *= 0.93
        this.life -= this.decay
      }
      draw(c) {
        if (this.life <= 0) return
        c.save()
        c.globalAlpha = Math.pow(this.life, 1.5)
        c.shadowBlur = this.glow ? 10 : 4
        c.shadowColor = this.color
        if (this.isLine) {
          c.strokeStyle = this.color
          c.lineWidth = this.size * 0.7
          c.lineCap = 'round'
          c.beginPath()
          c.moveTo(this.x, this.y)
          c.lineTo(
            this.x - Math.cos(this.angle) * this.lineLen * this.life,
            this.y - Math.sin(this.angle) * this.lineLen * this.life
          )
          c.stroke()
        } else {
          c.fillStyle = this.color
          c.beginPath()
          c.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2)
          c.fill()
        }
        c.restore()
      }
    }

    // QuickSetters for max-performance cursor positioning
    const setDotX = gsap.quickSetter(cursorDot, 'x', 'px')
    const setDotY = gsap.quickSetter(cursorDot, 'y', 'px')
    let prevX = -200, prevY = -200, curX = -200, curY = -200

    const onCursorMove = (e) => {
      prevX = curX; prevY = curY
      curX = e.clientX; curY = e.clientY
      const dx = curX - prevX, dy = curY - prevY
      const speed = Math.sqrt(dx * dx + dy * dy)

      // Snap dot immediately
      setDotX(curX); setDotY(curY)

      // Spawn sparks proportional to speed
      const count = Math.min(Math.ceil(speed * 0.25) + 1, 5)
      for (let i = 0; i < count; i++) sparks.push(new Spark(curX, curY, dx, dy))
    }
    window.addEventListener('mousemove', onCursorMove)

    // Render sparks via GSAP ticker
    const sparkLoop = () => {
      sparkCtx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height)
      for (let i = sparks.length - 1; i >= 0; i--) {
        sparks[i].update()
        sparks[i].draw(sparkCtx)
        if (sparks[i].life <= 0) sparks.splice(i, 1)
      }
    }
    gsap.ticker.add(sparkLoop)

    } // end isPointerDevice

    return () => {
      ctx.revert()
      lenis.destroy()
      lenisRef.current = null
      tiltCleanups.forEach(fn => fn())
      document.getElementById('__scroll_progress__')?.remove()
      if (isPointerDevice) {
        gsap.ticker.remove(sparkLoop)
        window.removeEventListener('mousemove', onCursorMove)
        window.removeEventListener('resize', resizeSpark)
        document.getElementById('__sparkle_canvas__')?.remove()
        document.getElementById('__cursor_dot__')?.remove()
      }
    }
  }, [])

  return (
    <>
      {/* ===== PAGE LOADER ===== */}
      <div id="__loader__" className="loader">
        <div className="loader_inner">
          <img className="loader_logo" src="/Assets/logo.png" alt="Push Digital" />
          <p className="loader_tagline">Enabling the Future of Electronics</p>
        </div>
        <div className="loader_bar_wrap">
          <div className="loader_bar_inner" />
        </div>
        <p className="loader_percent">0%</p>
      </div>

      <div ref={mainRef}>
      <section className='nav'>
        <nav>

          <img className="nav_logo" aria-label="Scroll to top" src="/Assets/logo.png" alt="Push Digital" onClick={() => lenisRef.current?.scrollTo('#hero', { offset: navOffset(), duration: 1.6 })} />


          <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`nav_links ${menuOpen ? 'open' : ''}`}>
            {NAV_SECTIONS.map(({ id, label,prop }) => (
              <a
                key={id}
                href={`#${id}`}
                id={prop}
                className={activeSection === id ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  setMenuOpen(false)
                  setActiveSection(id)
                  spyLockRef.current = true
                  lenisRef.current?.scrollTo(`#${id}`, {
                    offset: navOffset(),
                    duration: 1.2,
                    onComplete: () => { spyLockRef.current = false }
                  })
                }}
              >
                {label}
              </a>
            ))}
            <button>
              <Link href={'/consult'} onClick={() => setMenuOpen(false)}>Book a Consultation</Link>
            </button>
          </div>

          <div className={`nav_overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}></div>
        </nav>
      </section>

      <section className="hero" id="hero">

        <video autoPlay loop muted playsInline className="hero-video">
          <source src="/Assets/Hero/hero.mp4" type="video/mp4" />
        </video>

        <div className="hero-inner">
          <p className="big_text">
            Enabling the Future of Electronics -
            <span className="blue"> Flexible , Functional, Scalable</span>
          </p>

          <p className="small_text">
            From concept to small-scale manufacturing, we empower innovation
            with advanced flexible electronics production and rapid prototyping capabilities.
          </p>

          <div className="items">
            <p><img src="/Assets/Hero/Comp1.png" alt="" /> Printed Electronics</p>
            <p><img src="/Assets/Hero/Comp2.png" alt="" /> Flexible Substrates</p>
            <p><img src="/Assets/Hero/Comp3.png" alt="" /> Rapid Prototyping</p>
            <p><img src="/Assets/Hero/Comp4.png" alt="" /> Batch Production</p>
          </div>

          <div className="hero_button">
            <button onClick={() => lenisRef.current?.scrollTo('#contact', { offset: navOffset(), duration: 1.5 })}>Start Your Project</button>
            <button onClick={() => lenisRef.current?.scrollTo('#about', { offset: navOffset(), duration: 1.5 })}>Explore Technology</button>
          </div>
        </div>

      </section >

      <section className="about" id="about" style={{ marginBottom: "0px" }} >

        <div >
          <div className="about_vid">
            <video src="/Assets/About/about.mp4" autoPlay loop muted playsInline></video>
          </div>

          <div className="facility center">
            <h2>
              About the <span>Facility</span>
            </h2>

            <p>
              This facility is dedicated to advancing functional and flexible electronics by providing an integrated ecosystem for design, prototyping, testing, and small-scale production.
            </p>

            <p>
              As industries shift toward lightweight, adaptable, and cost-efficient solutions, we bridge the gap between innovation and manufacturability—enabling faster development cycles and real-world application readiness.
            </p>
          </div>


        </div>
      </section>

      <section className="mid">
        <div className="what_we_do" id="capabilities">
          <p>What We <span className="blue">Do</span></p>

          <div className="we_flex">
            <div className="what_we">
              <img src="/Assets/Mid/what1.png" alt="" />
              <p>Printed Electronics</p>
              <p>Advanced conductive ink printing for circuit fabrication on flexible substrates.</p>
            </div>
            <div className="what_we">
              <img src="/Assets/Mid/what2.png" alt="" />
              <p>SMD Assembly</p>
              <p>Specialized Surface Mount Device
                integration adapted for flexible
                materials.</p>
            </div>
            <div className="what_we">
              <img src="/Assets/Mid/what3.png" alt="" />
              <p>Prototyping & Testing</p>
              <p>Rapid validation, iteration, and proof-of-
                concept development.</p>
            </div>
            <div className="what_we">
              <img src="/Assets/Mid/what4.png" alt="" />
              <p>Batch Production</p>
              <p>Low-to-medium volume manufacturing
                for pilot runs and niche applications.</p>
            </div>
          </div>

        </div>

        <div className="advance_infra" id="infrastructure">
          <div className="dialoge">
            <p>Advance <span>Infrastructure</span></p>
            <p>Our facility is equipped with next-generation additive manufacturing tools and precision
              assembly systems designed specifically for flexible electronics.</p>
            <div>
              <div>
                <div>
                  <img src="/Assets/Mid/infra1.png" alt="" />
                  <p>Conductive Ink Printing Systems</p>
                </div>
                <div>
                  <img src="/Assets/Mid/infra2.png" alt="" />
                  <p>Flexible Substrate Handling Equipment</p>
                </div>
                <div>
                  <img src="/Assets/Mid/infra3.png" alt="" />
                  <p>SMD Assembly Lines</p>
                </div>
                <div>
                  <img src="/Assets/Mid/infra4.png" alt="" />
                  <p>Testing & Validation Labs</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </section>

      <section className="market" id="process">

        <div>
          <div className="idea_vid">
            <video src="/Assets/Idea/idea.mp4" autoPlay muted loop></video>

            <div  >
              <p>From Idea to <span className="blue">Market</span></p>
              <div className="baddie">
                <div className="baddie-line" />
                <div className="baddie-step">
                  <div className="baddie-circle"><div className="rounded">1</div></div>
                  <div className="baddie-label">Concept <br />Development</div>
                </div>
                <div className="baddie-step">
                  <div className="baddie-circle"><div className="rounded">2</div></div>
                  <div className="baddie-label">Design & <br />Simulation</div>
                </div>
                <div className="baddie-step">
                  <div className="baddie-circle"><div className="rounded">3</div></div>
                  <div className="baddie-label">Prototype <br />Fabrication</div>
                </div>
                <div className="baddie-step">
                  <div className="baddie-circle"><div className="rounded">4</div></div>
                  <div className="baddie-label">Testing & <br />Validation</div>
                </div>
                <div className="baddie-step">
                  <div className="baddie-circle"><div className="rounded">5</div></div>
                  <div className="baddie-label">Iteration & <br />Optimization</div>
                </div>
                <div className="baddie-step">
                  <div className="baddie-circle"><div className="rounded">6</div></div>
                  <div className="baddie-label">Batch Production</div>
                </div>
              </div>

            </div>

          </div>


        </div>
      </section>

      <section className="serve" id="applications">

        <div className="weserve">

          <p>Industries We <span>Serve</span> </p>

          <div className="serve_flex">
            <div>
              <span className="serve_icon"><img src="/Assets/Serve/serve1.png" alt="" /></span>
              <p>Wearable Technology</p>
            </div>
            <div>
              <span className="serve_icon"><img src="/Assets/Serve/serve2.png" alt="" /></span>
              <p>Smart Packaging</p>
            </div>
            <div>
              <span className="serve_icon"><img src="/Assets/Serve/serve3.png" alt="" /></span>
              <p>IoT Devices</p>
            </div>
            <div>
              <span className="serve_icon"><img src="/Assets/Serve/serve4.png" alt="" /></span>
              <p>Advanced Sensors</p>
            </div>
            <div>
              <span className="serve_icon"><img src="/Assets/Serve/serve5.png" alt="" /></span>
              <p>Healthcare Devices</p>
            </div>
            <div>
              <span className="serve_icon"><img src="/Assets/Serve/serve6.png" alt="" /></span>
              <p>Automotive Electronics</p>
            </div>
          </div>
        </div>
      </section>

      <section className="us" id="benefits">
        <div className="why_inner">
          <p className="why_title">Why Choose <span>Us</span></p>
          <div className="why_grid">
            <div className="why_card">
              <div className="why_ic">
                <img src="/Assets/Us/us1.png" alt="" />
              </div>
              <p>Faster Time-to-Market</p>
            </div>
            <div className="why_card">
              <div className="why_ic">
                <img src="/Assets/Us/us2.png" alt="" />
              </div>
              <p>Cost-Efficient Development</p>
            </div>
            <div className="why_card">
              <div className="why_ic">
                <img src="/Assets/Us/us3.png" alt="" />
              </div>
              <p>Flexible & Scalable Production</p>
            </div>
            <div className="why_card">
              <div className="why_ic">
                <img src="/Assets/Us/us4.png" alt="" />
              </div>
              <p>End-to-End Support</p>
            </div>
            <div className="why_card">
              <div className="why_ic">
                <img src="/Assets/Us/us5.png" alt="" />
              </div>
              <p>Innovation-Driven Ecosystem</p>
            </div>
          </div>
        </div>
      </section>

      <section className="vid_section">
        <video src="/Assets/vid.mp4" autoPlay muted loop></video>
      </section>



      <section className="faq" id="contact">
        <div className="faq_inner">
          <p className="faq_tag">FAQ</p>
          <p className="faq_title">Common Questions</p>
          <div className="faq_list">
            {[
              {
                q: "What is Electroluminescent Ink?",
                a: "Electroluminescent (EL) ink is a phosphor-based material that emits light when an alternating electric current is applied. It enables ultra-thin, flexible lighting for displays, wearables, and smart surfaces without heat or bulk."
              },
              {
                q: "What's the minimum order?",
                a: "We support both small-batch prototyping and large-scale production. Minimum order quantities vary by product type and substrate — contact us for a custom quote tailored to your project needs."
              },
              {
                q: "How fast is prototyping?",
                a: "Our prototyping turnaround is typically 5–10 business days depending on complexity and material requirements. Rush options are available for time-sensitive projects."
              },
              {
                q: "What substrates do you support?",
                a: "We print on a wide range of substrates including PET, PVC, fabric, paper, and custom flexible films. If you have a specific substrate in mind, we can evaluate compatibility for your application."
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`faq_item${openFaq === i ? " faq_open" : ""}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="faq_item_head">
                  <p>{item.q}</p>
                  <span>{openFaq === i ? "×" : "+"}</span>
                </div>
                {openFaq === i && (
                  <div className="faq_answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta_inner">
          <p className="cta_title">Ready to Build the Future of <span>Electronics?</span></p>
          <div className="cta_buttons">
            <button className="cta_primary">Start Your Project</button>
            <button className="cta_secondary">Contact Our Team</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer_inner">
          <div className="footer_col footer_about">
            <img src="/Assets/Logo.png" alt="Push Digital" />
            <p>Electroluminescent printing enabling ultra-thin, flexible, energy-efficient lighting solutions for next-generation electronics, wearables, smart surfaces, and innovative product design.</p>
          </div>
          <div className="footer_col footer_links">
            <p className="footer_head">Quick Links</p>
            <div className="footer_links_grid">
              {NAV_SECTIONS.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={activeSection === id ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveSection(id)
                    spyLockRef.current = true
                    lenisRef.current?.scrollTo(`#${id}`, {
                      offset: navOffset(),
                      duration: 1.2,
                      onComplete: () => { spyLockRef.current = false }
                    })
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div className="footer_col footer_contact">
            <p className="footer_head">Contact</p>
            <div className="footer_contact_row">
              <span className="ic"><img style={{ width: "16px" }} src="/Assets/Footer/location.png" alt="" /></span>
              <p>#339/97, Lakshmanaswamy Salai,<br />KK Nagar, Chennai - 600 078,<br />Tamil Nadu, INDIA.</p>
            </div>
            <div className="footer_contact_row">
              <span className="ic"><img style={{ width: "16px" }} src="/Assets/Footer/phone.png" alt="" /></span>
              <p>Landline: (+91) 44 - 42633329<br />Mobile: (+91) 98402 64453</p>
            </div>
            <div className="footer_contact_row">
              <span className="ic"><img style={{ width: "16px" }} src="/Assets/Footer/email.png" alt="" /></span>
              <p>enquiry@push.digital</p>
            </div>
          </div>
        </div>
        <div className="footer_bottom">
          <p>© 2026 Printing Electronics. All rights reserved.</p>
        </div>
      </footer>

      </div>
    </>
  )
}

export default Home
