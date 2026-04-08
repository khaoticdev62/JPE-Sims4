import React from 'react';
import { render, screen } from '@testing-library/react';
import AppShell from '../components/layout/App';

describe('Core IDE Shell & Three-Panel Layout', () => {
  it('should render the three primary layout panels (Sidebar, Editor, Preview)', () => {
    render(<AppShell />);
    
    // Check if placeholders exist
    expect(screen.getByText('No Project')).toBeInTheDocument();
    expect(screen.getByText(/Click 'Open' to select/)).toBeInTheDocument();
    
    expect(screen.getByText('Editor Content')).toBeInTheDocument();
    
    expect(screen.getByText('Preview / Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Preview Content')).toBeInTheDocument();
  });

  it('should render the TitleBar and StatusBar', () => {
    render(<AppShell />);
    
    // TitleBar
    expect(screen.getByText('JPE Mod Translator 2.0')).toBeInTheDocument();
    
    // StatusBar
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText(/Errors/)).toBeInTheDocument();
    expect(screen.getByText(/Warnings/)).toBeInTheDocument();
  });
});
