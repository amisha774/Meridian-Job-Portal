import React from 'react';
import { Link } from 'react-router-dom';
import developer from "../../assets/images/developer.jpeg"
import mentor from "../../assets/images/mentor.jpeg"


export const AboutPage: React.FC = () => {
  return (
    <>
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">About Meridian</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl text-balance">
            Built to replace opaque job boards with structured, transparent hiring
          </h1>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Meridian connects software engineers, product designers, data specialists, and operations leaders directly with verified hiring teams. Every listing requires explicit salary ranges, realistic timelines, and clear role expectations.
          </p>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            For recruiting teams, Meridian unifies company branding, candidate resume review, shortlisting, and real-time interview scheduling into a single workspace—removing fragmented spreadsheets and unreturned email threads.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/jobs"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
            >
              Browse Open Roles
            </Link>
            <Link
              to="/contact"
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              Contact Our Team
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
            <img
              src="/src/assets/images/about_team_collaboration_1795108889050.jpg"
              alt="Meridian hiring specialists reviewing candidate portfolios together"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 border-t border-slate-200 dark:border-slate-800 pt-12 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            01. Verified Organizations
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every employer profile is tied to an active recruiter account and moderated to eliminate ghost listings and duplicate postings.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            02. Real-Time Pipeline Clarity
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Candidates see instant status updates when applications move from review to shortlisted or interview scheduled—never left guessing.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            03. Resume & Skill Intelligence
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Automated PDF structure analysis identifies recognized technical competencies and surfaces roles aligned with your background.
          </p>
        </div>
        {/* 04. Secure Application Process */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            04. Secure Application Process
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every application is handled through a secure and reliable platform, keeping candidate information protected throughout the hiring process.
          </p>
        </div>
        {/* 05. Smart Job Matching */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            05. Smart Job Matching
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Our platform helps candidates discover relevant job opportunities based on their skills, experience, and career interests.
          </p>
        </div>
        {/* 06. Career Growth Opportunities */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            06. Career Growth Opportunities
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Explore new career opportunities, improve your professional skills, and take the next step towards your career goals.
          </p>
        </div>
      </div>
    </div>
    {/* Project Credits Section */ }

    <section className="py-5 px-3">
      <div className="container">

        <div className="text-center mb-5">
          <span className="text-uppercase fw-semibold"
          style={{ color: "#2563EB" }}>
            PROJECT CREDITS
            </span>

          <h2 className="fw-bold mt-2">
            Meet the People Behind Meridian
          </h2>

          <p className="text-muted">
            Designed and developed as part of the MERN
            Stack Development course.
          </p>
        </div>

        <div className="row justify-content-center g-4">

          {/* Project Developer */}

          <div className="col-md-5 col-lg-4">
            <div className="card h-100 border-0 shadow-sm text-center p-4">

              <img
                src={developer}
                alt="Amisha"
                className="rounded-circle mx-auto mb-3"
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                }}
              />
              
              <h4 className="fw-bold">Amisha</h4>

              <p className="fw-semibold" style={{ color: "#2563EB" }}>
              Project Developer
              </p>

              <p className="text-muted">
                Responsible for designing and developing
                Meridian Job Portal, implementing frontend
                and backend functionality, database
                integration, and application features.
              </p>
            </div>
          </div>
          {/* Project Mentor */}

          <div className="col-md-5 col-lg-4">
            <div className="card h-100 border-0 shadow-sm text-center p-4">

              <img
                src={mentor}
                alt="Mr. Arpit Gaveshinde"
                className="rounded-circle mx-auto mb-3"
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                }}
              />

              <h4 className="fw-bold">
                Mr. Arpit Gaveshinde
              </h4>

              <p className="fw-semibold" style={{ color: "#2563EB" }}>
              Project Guide & Mentor
              </p>

              <p className="text-muted">
                Provided technical guidance, mentorship,
                and supervision throughout the project
                development process.
              </p>

            </div>
          </div>

        </div>

        {/* Institute Details */}

        <div className="text-center mt-5 p-4 rounded-3 bg-light">

          <h4 className="fw-bold">
            Universal Informatics
          </h4>

          <p className="text-muted mb-2">
            Bhawarkua, Indore, Madhya Pradesh
          </p>

          <h6 className="fw-semibold" style={{ color: "#2563EB" }}>
          MERN Stack Development Course
          </h6>

        </div>

      </div>
    </section>
    </>
  );
};



export default AboutPage;