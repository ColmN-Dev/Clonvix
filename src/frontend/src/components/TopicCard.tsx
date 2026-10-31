export interface Topic {
  name: string;
  display_name: string;
  short_description: string;
}

function TopicCard({ topic }: { topic: Topic }) {
  const imageUrl = `https://raw.githubusercontent.com/github/explore/main/topics/${topic.name}/${topic.name}.png`;

  return (
    <article className="topic-card">
      <div className="topic-card-header">
        <img
          src={imageUrl}
          className="topic-card-avatar"
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        <a
          href={`https://github.com/topics/${topic.name}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {topic.name}
        </a>
      </div>

      <p>
        {topic.short_description || 'No description available.'}
      </p>
    </article>
  );
}

export default TopicCard;