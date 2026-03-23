// setup-supabase.js
// Script pour créer et configurer le bucket audio-files dans Supabase
// À exécuter une seule fois : node setup-supabase.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERREUR: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupSupabase() {
  console.log('⏳ Configuration de Supabase...\n');

  // 1. Créer le bucket
  console.log('1️⃣ Création du bucket "audio-files"...');
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'audio-files');

    if (bucketExists) {
      console.log('   ✅ Le bucket "audio-files" existe déjà');
    } else {
      const { error } = await supabase.storage.createBucket('audio-files', {
        public: true,
      });

      if (error) {
        console.error('   ❌ Erreur lors de la création du bucket:', error.message);
        process.exit(1);
      }
      console.log('   ✅ Bucket "audio-files" créé avec succès');
    }
  } catch (err) {
    console.error('   ❌ Erreur:', err.message);
    process.exit(1);
  }

  // 2. Vérifier que le bucket est public
  console.log('\n2️⃣ Vérification des permissions du bucket...');
  try {
    // Note: On ne peut pas directement modifier les policies via l'SDK
    // Mais on peut au moins vérifier que le bucket est public
    console.log('   ℹ️ Les policies doivent être configurées manuellement dans Supabase Dashboard');
    console.log('   📍 Aller à: Storage → audio-files → Policies');
    console.log('   ✅ Une policy "Public Read" doit exister pour SELECT');
    console.log('   ✅ Une policy "Authenticated Upload" doit exister pour INSERT');
  } catch (err) {
    console.error('   ❌ Erreur:', err.message);
  }

  // 3. Tester l'accès
  console.log('\n3️⃣ Test de connexion...');
  try {
    const { data, error } = await supabase.storage.from('audio-files').list('/', {
      limit: 1,
    });

    if (error) {
      console.error('   ❌ Erreur lors de l\'accès au bucket:', error.message);
      console.error('   💡 Vérifiez que le bucket est public et les policies sont configurées');
      process.exit(1);
    }

    console.log('   ✅ Accès au bucket réussi !');
  } catch (err) {
    console.error('   ❌ Erreur:', err.message);
    process.exit(1);
  }

  console.log('\n✨ Configuration Supabase terminée !');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Aller à https://app.supabase.io');
  console.log('2. Ouvrir votre projet TimeKids');
  console.log('3. Storage → audio-files → Policies');
  console.log('4. Ajouter ces deux policies:');
  console.log('   a) SELECT (Public Read): ALLOW SELECT');
  console.log('   b) INSERT (Authenticated): ALLOW INSERT WHERE auth.role() = "authenticated"');
  console.log('\n🚀 Après cela, les uploads devraient fonctionner !');
}

setupSupabase();
