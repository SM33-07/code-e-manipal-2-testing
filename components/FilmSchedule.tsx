import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Heart, MapPin, Clock, Star } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface FilmSession {
  id: string;
  title: string;
  director: string;
  duration: number;
  genre: string;
  rating: number;
  timeSlot: string;
  venue: string;
  date: string;
  description: string;
}

const mockSessions: FilmSession[] = [
  {
    id: '1',
    title: 'Midnight in the City',
    director: 'Sarah Chen',
    duration: 118,
    genre: 'Drama',
    rating: 8.7,
    timeSlot: '14:00 - 16:00',
    venue: 'Main Theater',
    date: '2026-03-15',
    description: 'A haunting exploration of urban isolation and human connection.'
  },
  {
    id: '2',
    title: 'The Last Horizon',
    director: 'Marcus Rodriguez',
    duration: 102,
    genre: 'Sci-Fi',
    rating: 9.1,
    timeSlot: '16:30 - 18:15',
    venue: 'Screen 2',
    date: '2026-03-15',
    description: 'An epic journey through space and time.'
  },
  {
    id: '3',
    title: 'Whispers of the Past',
    director: 'Elena Volkov',
    duration: 95,
    genre: 'Mystery',
    rating: 8.3,
    timeSlot: '19:00 - 20:35',
    venue: 'Main Theater',
    date: '2026-03-15',
    description: 'A gripping mystery set in post-war Eastern Europe.'
  },
  {
    id: '4',
    title: 'Dancing with Shadows',
    director: 'Jean-Pierre Laurent',
    duration: 110,
    genre: 'Romance',
    rating: 7.9,
    timeSlot: '14:00 - 16:00',
    venue: 'Screen 3',
    date: '2026-03-16',
    description: 'A beautiful tale of love and loss in Paris.'
  },
  {
    id: '5',
    title: 'Beyond the Mountains',
    director: 'Akira Tanaka',
    duration: 125,
    genre: 'Adventure',
    rating: 8.5,
    timeSlot: '16:30 - 19:00',
    venue: 'Main Theater',
    date: '2026-03-16',
    description: 'An breathtaking journey through the Himalayas.'
  },
  {
    id: '6',
    title: 'The Silent Echo',
    director: 'Maria Santos',
    duration: 88,
    genre: 'Thriller',
    rating: 8.8,
    timeSlot: '20:00 - 21:30',
    venue: 'Screen 2',
    date: '2026-03-16',
    description: 'A psychological thriller that will keep you on edge.'
  },
  {
    id: '7',
    title: 'Laughter in the Dark',
    director: 'Oliver Thompson',
    duration: 92,
    genre: 'Comedy',
    rating: 7.6,
    timeSlot: '15:00 - 16:45',
    venue: 'Screen 3',
    date: '2026-03-17',
    description: 'A hilarious comedy about life\'s unexpected turns.'
  },
  {
    id: '8',
    title: 'Echoes of War',
    director: 'David Mitchell',
    duration: 140,
    genre: 'Historical',
    rating: 9.3,
    timeSlot: '18:00 - 20:30',
    venue: 'Main Theater',
    date: '2026-03-17',
    description: 'A powerful epic about courage and sacrifice.'
  }
];

const venues = ['All Venues', 'Main Theater', 'Screen 2', 'Screen 3'];
const dates = ['2026-03-15', '2026-03-16', '2026-03-17'];

export function FilmSchedule() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedVenue, setSelectedVenue] = useState('All Venues');
  const [selectedDate, setSelectedDate] = useState(dates[0]);

  useEffect(() => {
    const stored = localStorage.getItem('filmfest_favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const toggleFavorite = (sessionId: string) => {
    if (!isAuthenticated) {
      alert('Please log in to favorite films');
      return;
    }

    const newFavorites = favorites.includes(sessionId)
      ? favorites.filter(id => id !== sessionId)
      : [...favorites, sessionId];
    
    setFavorites(newFavorites);
    localStorage.setItem('filmfest_favorites', JSON.stringify(newFavorites));
  };

  const filteredSessions = mockSessions.filter(session => {
    const venueMatch = selectedVenue === 'All Venues' || session.venue === selectedVenue;
    const dateMatch = session.date === selectedDate;
    return venueMatch && dateMatch;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Festival Schedule</h2>
          <p className="text-sm text-gray-600">Browse films by venue and date</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {venues.map(venue => (
              <option key={venue} value={venue}>{venue}</option>
            ))}
          </select>
        </div>
      </div>

      <Tabs value={selectedDate} onValueChange={setSelectedDate}>
        <TabsList className="grid w-full grid-cols-3">
          {dates.map(date => (
            <TabsTrigger key={date} value={date}>
              {formatDate(date)}
            </TabsTrigger>
          ))}
        </TabsList>

        {dates.map(date => (
          <TabsContent key={date} value={date} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.map(session => (
                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription className="mt-1">
                          Directed by {session.director}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(session.id)}
                        className="ml-2"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favorites.includes(session.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{session.description}</p>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{session.genre}</Badge>
                      <div className="flex items-center gap-1 text-sm text-yellow-600">
                        <Star className="w-4 h-4 fill-yellow-600" />
                        <span className="font-medium">{session.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{session.timeSlot}</span>
                        <span className="text-gray-400">({session.duration} min)</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{session.venue}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSessions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No films scheduled for this selection</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
