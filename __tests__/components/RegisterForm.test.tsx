import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '@/components/RegisterForm'

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch as any

describe('RegisterForm', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders registration form correctly', () => {
    render(<RegisterForm />)
    
    expect(screen.getByText('Crear cuenta')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Mínimo 8 caracteres')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Repite tu contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)
    
    const submitButton = screen.getByRole('button', { name: 'Crear cuenta' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument()
      expect(screen.getByText('El email es requerido')).toBeInTheDocument()
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
      expect(screen.getByText('Confirma tu contraseña')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)
    
    const emailInput = screen.getByPlaceholderText('tu@email.com')
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: 'Crear cuenta' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument()
    })
  })

  it('validates password strength', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)
    
    const passwordInput = screen.getByPlaceholderText('Mínimo 8 caracteres')
    await user.type(passwordInput, 'weak')
    
    const submitButton = screen.getByRole('button', { name: 'Crear cuenta' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('La contraseña debe tener al menos 8 caracteres')).toBeInTheDocument()
    })
  })

  it('validates password confirmation match', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)
    
    const passwordInput = screen.getByPlaceholderText('Mínimo 8 caracteres')
    const confirmPasswordInput = screen.getByPlaceholderText('Repite tu contraseña')
    
    await user.type(passwordInput, 'Password123')
    await user.type(confirmPasswordInput, 'Password456')
    
    const submitButton = screen.getByRole('button', { name: 'Crear cuenta' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Usuario creado' })
    })
    
    render(<RegisterForm />)
    
    await user.type(screen.getByPlaceholderText('Tu nombre'), 'John Doe')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'Password123')
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), 'Password123')
    
    const submitButton = screen.getByRole('button', { name: 'Crear cuenta' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'Password123'
          })
        })
      )
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
    
    render(<RegisterForm />)
    
    await user.type(screen.getByPlaceholderText('Tu nombre'), 'John Doe')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'Password123')
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), 'Password123')
    
    const submitButton = screen.getByRole('button', { name: 'Crear cuenta' })
    await user.click(submitButton)
    
    expect(screen.getByText('Creando cuenta...')).toBeInTheDocument()
  })
}