import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from './AuthProvider';
import { Users, Lock, Unlock, Copy, Check, UserPlus, LogIn, LogOut } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

interface Team {
  id: string;
  name: string;
  leaderId: string;
  members: TeamMember[];
  inviteCode: string;
  isLocked: boolean;
  maxSize: number;
  createdAt: string;
}

const HACKATHON_CONFIG = {
  name: 'LearnIT Team Challenge 2026',
  minTeamSize: 1,
  maxTeamSize: 4,
  phase: 1, // 1 = registration, 2 = submission
};

export function TeamManagement() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedTeams = localStorage.getItem('filmfest_teams');
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams));
    }
  }, []);

  useEffect(() => {
    if (user) {
      const userTeam = teams.find(team => 
        team.members.some(member => member.id === user.id)
      );
      setMyTeam(userTeam || null);
    } else {
      setMyTeam(null);
    }
  }, [user, teams]);

  const saveTeams = (updatedTeams: Team[]) => {
    setTeams(updatedTeams);
    localStorage.setItem('filmfest_teams', JSON.stringify(updatedTeams));
  };

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      setShowLogin(false);
      setEmail('');
      setPassword('');
      setError('');
    } catch (err) {
      setError('Login failed');
    }
  };

  const createTeam = () => {
    if (!user) {
      setError('Please log in to create a team');
      return;
    }

    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }

    if (myTeam) {
      setError('You are already in a team');
      return;
    }

    const newTeam: Team = {
      id: Math.random().toString(36).substring(7),
      name: teamName,
      leaderId: user.id,
      members: [{
        id: user.id,
        name: user.name,
        email: user.email,
        joinedAt: new Date().toISOString()
      }],
      inviteCode: generateInviteCode(),
      isLocked: false,
      maxSize: HACKATHON_CONFIG.maxTeamSize,
      createdAt: new Date().toISOString()
    };

    saveTeams([...teams, newTeam]);
    setTeamName('');
    setError('');
  };

  const joinTeam = () => {
    if (!user) {
      setError('Please log in to join a team');
      return;
    }

    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    if (myTeam) {
      setError('You are already in a team. Leave your current team first.');
      return;
    }

    const team = teams.find(t => t.inviteCode === inviteCode.toUpperCase());

    if (!team) {
      setError('Invalid invite code');
      return;
    }

    if (team.isLocked) {
      setError('This team is locked and no longer accepting members');
      return;
    }

    if (team.members.length >= team.maxSize) {
      setError('This team is full');
      return;
    }

    const updatedTeams = teams.map(t => {
      if (t.id === team.id) {
        return {
          ...t,
          members: [...t.members, {
            id: user.id,
            name: user.name,
            email: user.email,
            joinedAt: new Date().toISOString()
          }],
          // Single-use invite code: regenerate after use
          inviteCode: generateInviteCode()
        };
      }
      return t;
    });

    saveTeams(updatedTeams);
    setInviteCode('');
    setError('');
  };

  const leaveTeam = () => {
    if (!myTeam || !user) return;

    if (myTeam.leaderId === user.id) {
      if (myTeam.members.length > 1) {
        setError('As team leader, you must transfer leadership or disband the team before leaving');
        return;
      }
      // Leader leaving solo team - delete team
      saveTeams(teams.filter(t => t.id !== myTeam.id));
    } else {
      // Regular member leaving
      const updatedTeams = teams.map(t => {
        if (t.id === myTeam.id) {
          return {
            ...t,
            members: t.members.filter(m => m.id !== user.id)
          };
        }
        return t;
      });
      saveTeams(updatedTeams);
    }
    setError('');
  };

  const toggleLock = () => {
    if (!myTeam || !user || myTeam.leaderId !== user.id) return;

    if (HACKATHON_CONFIG.phase === 2 && !myTeam.isLocked) {
      setError('Cannot unlock team during Phase 2 (submission period)');
      return;
    }

    const updatedTeams = teams.map(t => {
      if (t.id === myTeam.id) {
        return { ...t, isLocked: !t.isLocked };
      }
      return t;
    });

    saveTeams(updatedTeams);
    setError('');
  };

  const copyInviteCode = () => {
    if (myTeam) {
      navigator.clipboard.writeText(myTeam.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const isTeamLeader = myTeam && user && myTeam.leaderId === user.id;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <LogIn className="w-5 h-5" />
              Login Required
            </CardTitle>
            <CardDescription className="text-gray-300">
              Sign in with your LearnIT SSO credentials to manage teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Sign In with SSO
              </Button>
              <p className="text-xs text-gray-400 text-center">
                This is a mock SSO login. Enter any email and password.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Management</h2>
          <p className="text-sm text-gray-300">{HACKATHON_CONFIG.name}</p>
        </div>
        <Button variant="outline" onClick={logout} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <Alert className="bg-white/10 backdrop-blur-md border-white/20">
        <AlertDescription className="text-gray-200">
          <strong>Phase {HACKATHON_CONFIG.phase}:</strong> {HACKATHON_CONFIG.phase === 1 ? 'Team Registration Open' : 'Submission Period - Teams Locked'}
          <br />
          Team size: {HACKATHON_CONFIG.minTeamSize}-{HACKATHON_CONFIG.maxTeamSize} members
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Team */}
        {myTeam ? (
          <Card className="md:col-span-2 bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5" />
                    {myTeam.name}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {isTeamLeader ? 'You are the team leader' : 'Team member'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={myTeam.isLocked ? 'destructive' : 'secondary'}>
                    {myTeam.isLocked ? (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3 mr-1" />
                        Open
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline" className="bg-white/10 border-white/30 text-white">
                    {myTeam.members.length}/{myTeam.maxSize}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Team Members */}
              <div>
                <h4 className="font-medium text-sm text-gray-200 mb-2">Team Members</h4>
                <div className="space-y-2">
                  {myTeam.members.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div>
                        <p className="font-medium text-sm text-white">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                      {member.id === myTeam.leaderId && (
                        <Badge variant="default">Leader</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite Code */}
              {isTeamLeader && !myTeam.isLocked && myTeam.members.length < myTeam.maxSize && (
                <div>
                  <h4 className="font-medium text-sm text-gray-200 mb-2">Invite Code</h4>
                  <div className="flex gap-2">
                    <Input
                      value={myTeam.inviteCode}
                      readOnly
                      className="font-mono bg-white/10 border-white/20 text-white"
                    />
                    <Button onClick={copyInviteCode} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      {copiedCode ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Single-use code. A new code will be generated after each use.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {isTeamLeader && (
                  <Button onClick={toggleLock} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    {myTeam.isLocked ? (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock Team
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Lock Team
                      </>
                    )}
                  </Button>
                )}
                <Button onClick={leaveTeam} variant="destructive">
                  {isTeamLeader ? 'Disband Team' : 'Leave Team'}
                </Button>
              </div>

              {myTeam.isLocked && (
                <Alert className="bg-white/10 backdrop-blur-md border-white/20">
                  <AlertDescription className="text-gray-200">
                    This team is locked. No new members can join, and members cannot leave until unlocked by the team leader.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Create Team */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Create a Team</CardTitle>
                <CardDescription className="text-gray-300">
                  Start a new team and invite members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Team Name
                  </label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <Button onClick={createTeam} className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              </CardContent>
            </Card>

            {/* Join Team */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Join a Team</CardTitle>
                <CardDescription className="text-gray-300">
                  Enter an invite code from a team leader
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Invite Code
                  </label>
                  <Input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="font-mono bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <Button onClick={joinTeam} className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Team
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* All Teams (for demonstration) */}
      {teams.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">All Teams ({teams.length})</CardTitle>
            <CardDescription className="text-gray-300">View all registered teams for this event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teams.map(team => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div>
                    <p className="font-medium text-white">{team.name}</p>
                    <p className="text-xs text-gray-400">
                      {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {team.isLocked && (
                      <Badge variant="destructive" className="text-xs">
                        <Lock className="w-3 h-3" />
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-white/10 border-white/30 text-white">
                      {team.members.length}/{team.maxSize}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
