import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const TestArticle = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching article with ID:', id);
        const response = await fetch(`/api/articles/${id}`);
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('API response:', result);
        setData(result);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h1>Test Article Component</h1>
      <p>ID: {id}</p>
      <p>Has error property: {data.error ? 'Yes' : 'No'}</p>
      <p>Error value: {data.error || 'None'}</p>
      <p>Title: {data.title || 'No title'}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default TestArticle;
