
import React from 'react';

const ApiKeyMissingPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100 text-gray-800 font-sans p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full text-center border-t-4 border-red-500 animate-fade-in">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Configuración Incompleta</h1>
        <p className="text-lg text-slate-700 mb-6">
          La aplicación no puede iniciar porque falta la clave API de Google Gemini.
        </p>
        <div className="text-left bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">¿Cómo solucionarlo?</h2>
          <p className="text-slate-600">Por favor, sigue estos pasos para configurar tu clave:</p>
          <ol className="list-decimal list-inside space-y-3 text-slate-600">
            <li>
              Busca y abre el archivo <strong>`env.js`</strong> en la carpeta de tu proyecto.
            </li>
            <li>
              Dentro del archivo, verás una línea que dice: <br/>
              <code className="bg-slate-200 text-slate-800 px-2 py-1 rounded-md inline-block my-1">
                API_KEY: 'PEGA_TU_API_KEY_AQUI'
              </code>
            </li>
            <li>
              Reemplaza el texto <strong>`PEGA_TU_API_KEY_AQUI`</strong> con tu clave real.
            </li>
            <li>
              Guarda el archivo y vuelve a publicar tu aplicación siguiendo los pasos del archivo `leer.txt`.
            </li>
          </ol>
           <p className="text-slate-600 pt-4 mt-4 border-t border-slate-200">
            Si no tienes una clave, puedes obtener una gratuitamente en{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-600 font-semibold hover:underline">
              Google AI Studio
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyMissingPage;