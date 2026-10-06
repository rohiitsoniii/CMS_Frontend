import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Book, MessageCircle, Mail, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  articleCount: number;
}

interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  tags: string[];
  viewCount: number;
  helpfulCount: number;
}

export function HelpCenterPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/help/categories');
      setCategories(data);
      if (data.length > 0) {
        loadArticlesForCategory(data[0].slug);
      }
    } catch (error) {
      toast.error('Failed to load help center');
    } finally {
      setLoading(false);
    }
  };

  const loadArticlesForCategory = async (categorySlug: string) => {
    try {
      const { data } = await api.get(`/help/categories/${categorySlug}`);
      setArticles(data.articles || []);
      setSelectedCategory(categorySlug);
      setSelectedArticle(null);
    } catch (error) {
      toast.error('Failed to load articles');
    }
  };

  const searchArticles = async () => {
    if (!searchQuery.trim()) return;
    try {
      const { data } = await api.get(`/help/articles/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const viewArticle = async (slug: string) => {
    try {
      const { data } = await api.get(`/help/articles/${slug}`);
      setSelectedArticle(data.article);
      setArticles([]);
      setSelectedCategory(null);
    } catch (error) {
      toast.error('Failed to load article');
    }
  };

  const markHelpful = async (helpful: boolean) => {
    if (!selectedArticle) return;
    try {
      await api.post(`/help/articles/${selectedArticle.slug}/helpful`, { helpful });
      toast.success('Thanks for your feedback!');
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const goBack = () => {
    setSelectedArticle(null);
    if (categories.length > 0) {
      loadArticlesForCategory(categories[0].slug);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground">Find answers and learn how to use Headless CMS</p>
      </div>

      <div className="mb-8">
        <div className="flex gap-2">
          <Input
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchArticles()}
          />
          <Button onClick={searchArticles}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>{searchResults.length} articles found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searchResults.map((article) => (
                <div
                  key={article._id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => viewArticle(article.slug)}
                >
                  <h3 className="font-medium">{article.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                  </p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4" onClick={() => setSearchResults([])}>
              Clear Results
            </Button>
          </CardContent>
        </Card>
      )}

      {!selectedArticle && searchResults.length === 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Browse by Category</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {categories.map((category) => (
                <Card
                  key={category._id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedCategory === category.slug ? 'border-primary' : ''
                  }`}
                  onClick={() => loadArticlesForCategory(category.slug)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{category.icon || '📚'}</span>
                      {category.name}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{category.articleCount} articles</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {articles.length > 0 && (
              <div className="space-y-4 mt-6">
                <h2 className="text-xl font-semibold">Articles in {selectedCategory}</h2>
                {articles.map((article) => (
                  <Card
                    key={article._id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => viewArticle(article.slug)}
                  >
                    <CardContent className="py-4">
                      <h3 className="font-medium flex items-center justify-between">
                        {article.title}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </h3>
                      <div className="flex gap-2 mt-2">
                        {article.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Need More Help?</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-sm text-muted-foreground">Chat with our support team</p>
                    <Button variant="link" size="sm" className="px-0">
                      Start Chat
                    </Button>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-muted-foreground">Get help via email</p>
                    <Button variant="link" size="sm" className="px-0" asChild>
                      <a href="mailto:support@headlesscms.com">Contact Us</a>
                    </Button>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Book className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Documentation</h3>
                    <p className="text-sm text-muted-foreground">Full API and feature docs</p>
                    <Button variant="link" size="sm" className="px-0" asChild>
                      <a href="/docs" target="_blank">View Docs</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {selectedArticle && (
        <div className="space-y-6">
          <Button variant="ghost" onClick={goBack}>
            ← Back to Categories
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{selectedArticle.category}</Badge>
                {selectedArticle.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
              
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">Was this article helpful?</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => markHelpful(true)}>
                    <ThumbsUp className="w-4 h-4 mr-1" /> Yes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => markHelpful(false)}>
                    <ThumbsDown className="w-4 h-4 mr-1" /> No
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}