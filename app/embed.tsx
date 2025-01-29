export default function EmbedPage() {
    return (
      <div className="w-screen h-screen">
        <iframe
          src="https://earn-paper.vercel.app"
          width="100%"
          height="100%"
          style={{ border: "none" }}
          allowFullScreen
        />
      </div>
    );
  }
  