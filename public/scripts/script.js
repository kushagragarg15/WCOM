;(() => {
  const byId = (id) => document.getElementById(id)
  const select = (q, el = document) => el.querySelector(q)
  const selectAll = (q, el = document) => Array.from(el.querySelectorAll(q))

  // Current year
  const yearEl = byId("year")
  if (yearEl) yearEl.textContent = new Date().getFullYear()

  // Mobile nav toggle
  const toggle = select(".nav-toggle")
  const nav = byId("site-nav")
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true"
      toggle.setAttribute("aria-expanded", String(!expanded))
      nav.classList.toggle("open", !expanded)
    })
    // Close menu when clicking link (mobile)
    nav.addEventListener("click", (e) => {
      const t = e.target
      if (t && t.tagName === "A" && nav.classList.contains("open")) {
        nav.classList.remove("open")
        toggle.setAttribute("aria-expanded", "false")
      }
    })
  }

  // Active nav link highlight
  const path = window.location.pathname.replace(/\/+$/, "")
  selectAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href") || ""
    const normalized = href.replace(/\/+$/, "")
    if (normalized === "" && path === "") return
    if (normalized === path) {
      a.classList.add("is-active")
    }
  })

  // Reveal on scroll
  const reveals = selectAll(".reveal")
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    )
    reveals.forEach((el) => io.observe(el))
  } else {
    // Fallback: show immediately
    reveals.forEach((el) => el.classList.add("visible"))
  }
})()
