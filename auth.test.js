// Simulamos el SDK de Supabase
const mockSignIn = jest.fn();
const supabase = {
  auth: {
    signInWithPassword: mockSignIn
  }
};

// La función que evalúa nuestra Caja Blanca
async function iniciarSesion(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error; // Si hay error, brinca al catch
    
    return data.session;    // Si no hay error, retorna el token
  } catch (err) {
    return { errorValidacion: err.message }; // El camino alternativo
  }
}

// Los Casos de Prueba (Jest)
describe('Caja Blanca: Función iniciarSesion()', () => {

  test('CB-01.1: El try se ejecuta con éxito (Camino con Éxito)', async () => {
    // Forzamos a Supabase a responder que todo salió bien
    mockSignIn.mockResolvedValue({ 
      data: { session: 'token_valido_123' }, 
      error: null 
    });

    const resultado = await iniciarSesion('valido@gury.com', '123');
    
    expect(resultado).toBe('token_valido_123'); // Verificamos la salida
    expect(mockSignIn).toHaveBeenCalledTimes(1); // Verificamos que sí llamó a BD
  });

  test('CB-01.2: El catch captura el error de Supabase (Camino de Error)', async () => {
    // Forzamos a Supabase a lanzar un error de credenciales
    mockSignIn.mockResolvedValue({ 
      data: null, 
      error: { message: 'Invalid credentials' } 
    });

    const resultado = await iniciarSesion('valido@gury.com', 'mala');
    
    expect(resultado.errorValidacion).toBe('Invalid credentials'); // Verificamos el catch
  });

});