export default function Home() {
  return (
    <div className="container">
      <div className="title">
        <h1>Protecting the Environment with Transparency</h1>
      </div>
      <div className="video-container">
        <div className="video-border">
          <iframe
            className="video-embed"
            src="https://www.youtube.com/embed/VIDEO_ID_HERE"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div className="text-container">
        <div className="text-border"></div>
      </div>
    </div>
  );
};