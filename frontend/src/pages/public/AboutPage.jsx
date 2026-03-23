// frontend/src/pages/public/AboutPage.jsx
import React from "react";
import schoolImage from "../../assets/school.png";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-neutral-bg-subtle text-gray-800 overflow-hidden">

      {/* ------------------------------------------------------------------ */}
      {/*                            HERO SECTION                           */}
      {/* ------------------------------------------------------------------ */}
      <header
        className="relative h-[55vh] flex items-center justify-center text-center"
        style={{
          backgroundImage: `linear-gradient(
            to bottom right,
            rgba(2,6,23,0.55),
            rgba(2,6,23,0.4)
          ), url(${schoolImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="animate-fade-up text-white px-6">
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold drop-shadow-lg">
            About Our School
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto drop-shadow">
            A legacy of excellence, discipline, and future-ready education.
          </p>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/*                             PAGE BODY                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* ------------------------------------------------------------------ */}
        {/*                             OUR STORY                             */}
        {/* ------------------------------------------------------------------ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-28">
          <div className="animate-fade-right">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-900 mb-5">
              Our Story
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed">
              SBS School began with a vision to cultivate a nurturing, disciplined,
              and academically strong environment. Over the years, it has evolved
              into an institution known for excellence, innovation, and integrity.
            </p>

            <p className="text-lg text-gray-700 mt-4 leading-relaxed">
              Rooted in strong values and enhanced by modern teaching tools,
              our school ensures that every student is encouraged to dream big,
              think creatively, and grow holistically.
            </p>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 gap-4 animate-fade-left">
            <img
              src={schoolImage}
              alt="School"
              className="rounded-xl shadow-lg object-cover h-52 w-full border border-gray-200"
            />
            <img
              src={schoolImage}
              alt="School"
              className="rounded-xl shadow-lg object-cover h-52 w-full border border-gray-200"
            />
            <img
              src={schoolImage}
              alt="School"
              className="rounded-xl shadow-lg object-cover h-52 w-full border border-gray-200"
            />
            <img
              src={schoolImage}
              alt="School"
              className="rounded-xl shadow-lg object-cover h-52 w-full border border-gray-200"
            />
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/*                         MISSION & VISION                           */}
        {/* ------------------------------------------------------------------ */}
        <section className="mb-28 bg-white p-12 rounded-2xl shadow-xl border border-gray-200 animate-fade-up">
          <h2 className="text-3xl md:text-4xl text-center font-heading font-bold text-primary-900 mb-10">
            Mission & Vision
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="transition hover:scale-[1.02]">
              <h3 className="text-2xl font-heading text-accent-500 font-semibold mb-3">
                Our Mission
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                To provide quality education that inspires curiosity, discipline,
                creativity, and strong moral values — shaping tomorrow’s leaders.
              </p>
            </div>

            <div className="transition hover:scale-[1.02]">
              <h3 className="text-2xl font-heading text-accent-500 font-semibold mb-3">
                Our Vision
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                To create a globally competent generation equipped with knowledge,
                confidence, and skills to thrive in the modern world.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/*                           CORE VALUES                              */}
        {/* ------------------------------------------------------------------ */}
        <section className="mb-28">
          <h2 className="text-3xl md:text-4xl font-heading text-primary-900 font-bold text-center mb-12">
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: "Integrity", icon: "💎", desc: "We uphold honesty and strong moral principles in all actions." },
              { title: "Discipline", icon: "⚡", desc: "We nurture character through structure, respect, and consistency." },
              { title: "Excellence", icon: "⭐", desc: "We motivate students to achieve their highest academic potential." },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all text-center animate-fade-up"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-heading text-accent-500 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/*                          WHY CHOOSE US                             */}
        {/* ------------------------------------------------------------------ */}
        <section className="bg-white p-12 rounded-2xl shadow-xl border border-gray-200 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-900 text-center mb-12">
            Why Choose SBS?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Modern Learning", desc: "Smart classrooms, science labs, and interactive digital learning." },
              { title: "Expert Faculty", desc: "Highly trained teachers dedicated to nurturing every student." },
              { title: "Holistic Growth", desc: "Sports, arts, discipline, leadership & life-skills development." },
            ].map((item, index) => (
              <div
                key={index}
                className="p-8 bg-neutral-bg-subtle rounded-2xl border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <h3 className="text-2xl font-heading text-accent-500 font-semibold mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutPage;
