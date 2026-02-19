import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Journal from "@/pages/Journal";
import Breathe from "@/pages/Breathe";
import MudraDetail from "@/pages/MudraDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/journal" component={Journal} />
      <Route path="/breathe" component={Breathe} />
      <Route path="/mudra/:id" component={MudraDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
