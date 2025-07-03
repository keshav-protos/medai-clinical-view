import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, LogOut, Activity, Upload, LayoutDashboard } from 'lucide-react';
import { HealthIndicator } from '@/components/HealthIndicator';

const Layout = () => {
  const { user, signOut, loading } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const userInitials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Med-AI</h1>
                <p className="text-sm text-muted-foreground">Clinical Document Processing</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Link 
                to="/" 
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </Link>
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </nav>

            {/* Health Indicator */}
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <HealthIndicator />
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="hidden md:flex">
                {user.user_metadata?.full_name || user.email}
              </Badge>
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;