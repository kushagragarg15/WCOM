'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail, Linkedin, Youtube, ExternalLink } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="site-header" role="banner">
        <div className="container nav">
          <Link className="brand" href="/" aria-label="WCOM Lab Home">
            <span>WCOM Lab</span>
            <span className="dept-label">Department of CCE</span>
          </Link>
          <nav className="nav-links" role="navigation">
            <Link href="/">Home</Link>
            <Link href="/assignments">Assignments</Link>
            <Link href="/contact">Contact</Link>
            <Image 
              src="https://lnmiit.ac.in/wp-content/uploads/2023/07/LNMIIT-Logo-Transperant-Background.png" 
              alt="LNMIIT Logo" 
              width={80} 
              height={80}
              className="lnmiit-logo"
            />
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="contact-header">
          <Link href="/" className="back-link">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">
            Meet the team behind the WCOM Lab Assignments Portal
          </p>
        </div>

        <div className="contact-content">
          {/* Faculty Section */}
          <section className="team-section">
            <h2 className="section-heading">Faculty Supervisor</h2>
            <div className="faculty-card">
              <div className="faculty-profile">
                <div className="faculty-image">
                  <Image 
                    src="https://login.lnmiit.ac.in/uploads/faculty/dr-nishant-gupta.jpg"
                    alt="Dr. Nishant Gupta Sir"
                    width={200}
                    height={250}
                    className="professor-photo"
                  />
                </div>
                <div className="profile-info">
                  <h3 className="profile-name">Dr. Nishant Gupta Sir</h3>
                  <p className="profile-title">Assistant Professor</p>
                <p className="profile-department">Department of Computer & Communication Engineering</p>
                <p className="profile-institution">The LNM Institute of Information Technology (LNMIIT)</p>
                
                <div className="profile-details">
                  <h4>Biography</h4>
                  <p className="biography-text">
                    NISHANT GUPTA (Joined Department on 28/08/2024) (Member, IEEE) received the Ph.D. degree 
                    from Indian Institute of Technology Ropar, India, in 2023, the M.Tech. degree in electronics 
                    and communication from Panjab University, Chandigarh, India, in 2018, and the B.Tech. degree 
                    in electronics and communication engineering from Chandigarh Engineering College, Mohali, India, 
                    in 2015. Prior to joining LNMIIT, he was a Postdoctoral Researcher with the Department of 
                    Electrical Engineering, Linköping University, Linköping, Sweden. His research interests include 
                    5G networks, UAV communications, air-borne networks, and optimization.
                  </p>
                  
                  <h4>Research Interests</h4>
                  <ul className="research-interests">
                    <li>5G Networks</li>
                    <li>UAV Communications</li>
                    <li>Air-borne Networks</li>
                    <li>Optimization</li>
                  </ul>
                </div>

                <div className="contact-links">
                  <a href="mailto:nishant.gupta@lnmiit.ac.in" className="contact-link email">
                    <Mail size={20} />
                    nishant.gupta@lnmiit.ac.in
                  </a>
                  <a href="https://www.linkedin.com/in/nishant-gupta-b8b813a2" target="_blank" rel="noopener noreferrer" className="contact-link linkedin">
                    <Linkedin size={20} />
                    LinkedIn Profile
                  </a>
                  <a href="https://www.youtube.com/@wireless_visionaries" target="_blank" rel="noopener noreferrer" className="contact-link youtube">
                    <Youtube size={20} />
                    Wireless Visionaries
                  </a>
                </div>
              </div>
              </div>
            </div>
          </section>

          {/* Student Developers Section */}
          <section className="team-section">
            <h2 className="section-heading">Student Developers</h2>
            <div className="developers-grid">
              
              {/* Developer 1 - 23UCC546 */}
              <div className="developer-card">
                <div className="developer-profile">
                  <div className="developer-image">
                    <Image 
                      src="/placeholder-user.jpg"
                      alt="Harshita Devnani"
                      width={120}
                      height={120}
                      className="student-photo"
                    />
                  </div>
                  <div className="developer-info">
                    <h3 className="developer-name">Harshita Devnani</h3>
                    <p className="developer-id">23UCC546</p>
                    <p className="developer-program">B.Tech Computer & Communication Engineering</p>
                    <p className="developer-institution">LNMIIT</p>
                    
                    <div className="contact-links">
                      <a href="mailto:23ucc546@lnmiit.ac.in" className="contact-link email">
                        <Mail size={18} />
                        23ucc546@lnmiit.ac.in
                      </a>
                      <a href="https://www.linkedin.com/in/harshita-devnani-50b873301/" target="_blank" rel="noopener noreferrer" className="contact-link linkedin">
                        <Linkedin size={18} />
                        LinkedIn Profile
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer 2 - 23UCC564 */}
              <div className="developer-card">
                <div className="developer-profile">
                  <div className="developer-image">
                    <Image 
                      src="https://media.licdn.com/dms/image/v2/D5603AQH62VHdeFfX7g/profile-displayphoto-scale_400_400/B56ZiM.tE5HQAg-/0/1754711906941?e=1762387200&v=beta&t=CXnkIft0UaRgiJqVz39_LBlFdT-20ru9iN2TKjForKU"
                      alt="Kushagra Garg"
                      width={120}
                      height={120}
                      className="student-photo"
                    />
                  </div>
                  <div className="developer-info">
                    <h3 className="developer-name">Kushagra Garg</h3>
                    <p className="developer-id">23UCC564</p>
                    <p className="developer-program">B.Tech Computer & Communication Engineering</p>
                    <p className="developer-institution">LNMIIT</p>
                    
                    <div className="contact-links">
                      <a href="mailto:23ucc564@lnmiit.ac.in" className="contact-link email">
                        <Mail size={18} />
                        23ucc564@lnmiit.ac.in
                      </a>
                      <a href="https://www.linkedin.com/in/kushagra-garg-6b63262aa/" target="_blank" rel="noopener noreferrer" className="contact-link linkedin">
                        <Linkedin size={18} />
                        LinkedIn Profile
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer 3 - 23UCC565 */}
              <div className="developer-card">
                <div className="developer-profile">
                  <div className="developer-image">
                    <Image 
                      src="https://media.licdn.com/dms/image/v2/D5603AQG_v390lOy_Sg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1729360488108?e=1762387200&v=beta&t=9H6g5IxQvYwOQ9BdbXsUeciwPld5AkY9KGv5Kh8D4KE"
                      alt="Kushagra Rajput"
                      width={120}
                      height={120}
                      className="student-photo"
                    />
                  </div>
                  <div className="developer-info">
                    <h3 className="developer-name">Kushagra Rajput</h3>
                    <p className="developer-id">23UCC565</p>
                    <p className="developer-program">B.Tech Computer & Communication Engineering</p>
                    <p className="developer-institution">LNMIIT</p>
                    
                    <div className="contact-links">
                      <a href="mailto:23ucc565@lnmiit.ac.in" className="contact-link email">
                        <Mail size={18} />
                        23ucc565@lnmiit.ac.in
                      </a>
                      <a href="https://www.linkedin.com/in/kushagra-pratap-singh-510125334/" target="_blank" rel="noopener noreferrer" className="contact-link linkedin">
                        <Linkedin size={18} />
                        LinkedIn Profile
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer 4 - 23UCC566 */}
              <div className="developer-card">
                <div className="developer-profile">
                  <div className="developer-image">
                    <Image 
                      src="/placeholder-user.jpg"
                      alt="Lahar Joshi"
                      width={120}
                      height={120}
                      className="student-photo"
                    />
                  </div>
                  <div className="developer-info">
                    <h3 className="developer-name">Lahar Joshi</h3>
                    <p className="developer-id">23UCC566</p>
                    <p className="developer-program">B.Tech Computer & Communication Engineering</p>
                    <p className="developer-institution">LNMIIT</p>
                    
                    <div className="contact-links">
                      <a href="mailto:23ucc566@lnmiit.ac.in" className="contact-link email">
                        <Mail size={18} />
                        23ucc566@lnmiit.ac.in
                      </a>
                      <a href="https://www.linkedin.com/in/lahar-joshi-120411302/" target="_blank" rel="noopener noreferrer" className="contact-link linkedin">
                        <Linkedin size={18} />
                        LinkedIn Profile
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Fun Grade Button */}
          <section className="team-section">
            <div className="grade-button-container">
              <GradeButton />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function GradeButton() {
  const [clicks, setClicks] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const targetClicks = 65

  const handleClick = () => {
    if (clicks < targetClicks) {
      const newClicks = clicks + 1
      setClicks(newClicks)
      
      if (newClicks >= targetClicks) {
        setIsCompleted(true)
      }
    }
  }

  return (
    <div className="grade-button-wrapper">
      <button 
        className={`grade-button ${isCompleted ? 'completed' : ''}`}
        onClick={handleClick}
        disabled={isCompleted}
      >
        {isCompleted ? 'Grade A' : clicks === 0 ? 'Click me for an A' : `Clicks: ${clicks}/${targetClicks}`}
      </button>
      {clicks > 0 && clicks < targetClicks && (
        <div className="progress-hint">
          <div className="progress-bar-small">
            <div 
              className="progress-fill-small" 
              style={{ width: `${(clicks / targetClicks) * 100}%` }}
            ></div>
          </div>
          <p className="hint-text">Keep clicking! {targetClicks - clicks} more to go...</p>
        </div>
      )}
      {isCompleted && (
        <div className="success-message">
          <p className="grade-earned">A+ Achieved!</p>
          <p className="grade-quote">
            "Easy clicks, hard exams!"
          </p>
        </div>
      )}
    </div>
  )
}