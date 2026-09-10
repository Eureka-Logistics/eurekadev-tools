import React from "react";
import { Link } from "react-router-dom";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto p-12 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto border border-border">
        <FileQuestion className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Tool Not Found
        </h1>
        <p className="text-muted-foreground text-sm">
          The tool or page you requested could not be located. It might have
          been moved or does not exist.
        </p>
      </div>
      <Link to="/">
        <Button variant="default" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Eureka Dev Tools
        </Button>
      </Link>
    </div>
  );
};
