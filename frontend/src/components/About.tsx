function About() {
  return (
    <div className="about-content">
      <section className="jumbotron text-center bg-white">
        <div className="container">
          <h1 className="jumbotron-heading">About</h1>
          <p className="lead text-muted">
            Graphic Libraries created by{" "}
            <a href="https://endlessforms.info" target="_blank">
              Endless Forms Studio
            </a>
          </p>
        </div>
      </section>
      <main>
        <div className="container py-5">
          <h2>Anatomical graphics for information systems</h2>
          <div className="lead text-muted justify">
            These graphics are designed to serve as standards for visual
            representation of anatomy and as interface elements for information
            systems. Similar to the role of terminologies and ontologies in
            providing standard terms for describing anatomy, these graphics
            provide standards for visual representation. The graphics depict
            generalized anatomy, rather than anatomy of a particular individual.
            We represent typical anatomy as well as variations, anomalies, and
            malformations, and our work includes both human anatomy and the
            anatomy of other species. Some of our libraries represent anatomy
            during different developmental stages of the organism.
          </div>
          <h2 className="mt-5">
            Designed using human intelligence, nothing artificial
          </h2>
          <div className="lead text-muted justify">
            Our graphics are based on anatomical evidence. The first step in our
            work is gathering the best evidence available—published literature,
            clinical images, anatomical specimens, surgical photos—and
            performing our own dissections using cadavers at the University of
            Kentucky. We also investigate how anatomical structures were
            represented by early medical illustrators through surveying medical
            literature and textbooks produced from the 1800s to mid-1900s. We
            work with clinicians and other domain experts to review drafts of
            our graphics to ensure that we are accurately capturing morphology
            and that the salient features of the structures are clearly
            communicated.
          </div>
          <h2 className="mt-5">Our “illustration-to-informatics” pipeline</h2>
          <div className="lead text-muted justify">
            Our workflow begins by sketching a set of graphics, receiving
            feedback, and revising the graphics in multiple rounds. Once the
            designs are finalized, we begin our “illustration-to-informatics”
            pipeline by drawing the graphics in Adobe Illustrator as a
            collection of paths. We refer to our graphics as composable graphics
            because rather than redrawing the same path multiple times for a
            similar graphics, we draw a set of paths that are assembled in
            different combinations to create different (but similar) graphics.
            Every path is an element that we track in our software system. Once
            these elements are assigned unique identifiers, the designer uses
            these identifiers to specify which paths are to be composed together
            to create the graphics. Our system also holds instructions on how to
            assemble the graphics and metadata about the graphics, which is used
            to generate what you see on this website. This approach allows us to
            incorporate machine-readable data into the graphics, query over the
            database, and compose larger graphics from smaller graphics using
            computational commands.
          </div>
        </div>
      </main>
    </div>
  );
}

export default About;