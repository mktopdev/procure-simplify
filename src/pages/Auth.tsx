import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#276955] to-[#E16C31] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-xl shadow-xl p-8"
      >
        <div className="mb-8 text-center">
          <img 
            src="/lovable-uploads/52995933-69cf-4d4e-a3b0-1d5fea816533.png" 
            alt="Groupe Guiter" 
            className="h-12 mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold text-gray-900">Bienvenue</h2>
          <p className="text-gray-600 mt-2">Connectez-vous ou créez un compte</p>
        </div>

        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#276955',
                  brandAccent: '#E16C31',
                }
              }
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Adresse e-mail',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
                loading_button_label: 'Connexion en cours...',
                social_provider_text: 'Continuer avec {{provider}}',
                link_text: 'Vous avez déjà un compte ? Connectez-vous',
              },
              sign_up: {
                email_label: 'Adresse e-mail',
                password_label: 'Mot de passe',
                button_label: 'Créer un compte',
                loading_button_label: 'Création du compte...',
                social_provider_text: 'Continuer avec {{provider}}',
                link_text: 'Pas encore de compte ? Inscrivez-vous',
                confirmation_text: 'Vérifiez vos e-mails pour confirmer votre inscription',
              },
              forgotten_password: {
                email_label: 'Adresse e-mail',
                password_label: 'Mot de passe',
                button_label: 'Réinitialiser le mot de passe',
                loading_button_label: 'Envoi en cours...',
                confirmation_text: 'Vérifiez vos e-mails pour réinitialiser votre mot de passe',
              },
            },
          }}
          providers={[]}
        />
      </motion.div>
    </div>
  );
};

export default Auth;