import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, CheckCircle, BarChart3, Zap } from 'lucide-react';

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-800">Voice Task Manager</h1>
            </div>
            <Button onClick={handleLogin} className="gradient-primary text-white hover:opacity-90">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800">
              Manage Tasks with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Your Voice</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your productivity with AI-powered voice recognition. Create, organize, and track tasks effortlessly with just your voice.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="gradient-primary text-white hover:opacity-90 px-8 py-6 text-lg"
            >
              Start Voice Tasks Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Voice Task Manager?</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the future of task management with intelligent voice recognition and smart priority detection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-effect border-blue-100/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Voice Recognition</h4>
              <p className="text-gray-600 text-sm">
                Advanced speech-to-text technology that understands your voice commands perfectly.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-blue-100/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Smart Priority</h4>
              <p className="text-gray-600 text-sm">
                AI automatically detects task priority based on your voice keywords and context.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-blue-100/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Task Tracking</h4>
              <p className="text-gray-600 text-sm">
                Effortlessly track completion rates and stay on top of your daily goals.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-blue-100/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Analytics</h4>
              <p className="text-gray-600 text-sm">
                Detailed insights and statistics to help you optimize your productivity.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="glass-effect border-blue-100/50">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Ready to Transform Your Productivity?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already managing their tasks more efficiently with voice commands.
            </p>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="gradient-primary text-white hover:opacity-90 px-8 py-6 text-lg"
            >
              Get Started Free
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold">Voice Task Manager</span>
          </div>
          <p className="text-gray-400">
            © 2025 Voice Task Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
