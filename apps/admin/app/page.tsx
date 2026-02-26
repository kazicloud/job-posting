import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-neutral-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-semibold text-neutral-text">
              Kazicloud Admin
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-text mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-neutral-text">247</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-neutral-text">1,834</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-neutral-text">5,621</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-neutral-border">
                <div>
                  <p className="font-medium text-neutral-text">John Doe</p>
                  <p className="text-sm text-neutral-text-muted">Senior Software Engineer</p>
                </div>
                <span className="text-sm text-neutral-text-secondary">2h ago</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-neutral-border">
                <div>
                  <p className="font-medium text-neutral-text">Jane Smith</p>
                  <p className="text-sm text-neutral-text-muted">Product Designer</p>
                </div>
                <span className="text-sm text-neutral-text-secondary">5h ago</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <div>
                  <p className="font-medium text-neutral-text">Mike Johnson</p>
                  <p className="text-sm text-neutral-text-muted">Data Analyst</p>
                </div>
                <span className="text-sm text-neutral-text-secondary">1d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
