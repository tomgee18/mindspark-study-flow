# Component Prop Types Template

This document provides templates for adding proper prop types to React components.

## Function Component with Props

```tsx
import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <button
      className={`button ${variant} ${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
```

## Function Component with Generic Props

```tsx
import React from 'react';

interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
  placeholder?: string;
  disabled?: boolean;
}

function Select<T>({
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  placeholder = 'Select...',
  disabled = false,
}: SelectProps<T>): React.ReactElement {
  return (
    <select
      value={value ? getOptionValue(value).toString() : ''}
      onChange={(e) => {
        const selectedOption = options.find(
          (option) => getOptionValue(option).toString() === e.target.value
        );
        if (selectedOption) {
          onChange(selectedOption);
        }
      }}
      disabled={disabled}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option
          key={getOptionValue(option).toString()}
          value={getOptionValue(option).toString()}
        >
          {getOptionLabel(option)}
        </option>
      ))}
    </select>
  );
}

export default Select;
```

## Component with Event Handlers

```tsx
import React from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number';
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = '',
  type = 'text',
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      className="input"
    />
  );
};

export default Input;
```

## Component with Children and Ref

```tsx
import React, { forwardRef } from 'react';

interface CardProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', onClick, children }, ref) => {
    return (
      <div ref={ref} className={`card ${className}`} onClick={onClick}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
```

## Component with Polymorphic Props

```tsx
import React, { ElementType, ComponentPropsWithoutRef } from 'react';

type BoxProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
} & ComponentPropsWithoutRef<T>;

const Box = <T extends ElementType = 'div'>({
  as,
  className = '',
  children,
  ...rest
}: BoxProps<T>) => {
  const Component = as || 'div';
  return (
    <Component className={`box ${className}`} {...rest}>
      {children}
    </Component>
  );
};

export default Box;
```

## Component with Conditional Props

```tsx
import React from 'react';

type LoadingButtonProps =
  | {
      isLoading: true;
      onClick?: never;
      children: React.ReactNode;
    }
  | {
      isLoading?: false;
      onClick: () => void;
      children: React.ReactNode;
    };

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  onClick,
  children,
}) => {
  return (
    <button
      className={`button ${isLoading ? 'loading' : ''}`}
      onClick={isLoading ? undefined : onClick}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

export default LoadingButton;
```

## Component with Context

```tsx
import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ defaultTab, children }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

interface TabProps {
  id: string;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ id, children }) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab must be used within a Tabs component');
  }

  const { activeTab, setActiveTab } = context;

  return (
    <button
      className={`tab ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
};

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = ({ id, children }) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabPanel must be used within a Tabs component');
  }

  const { activeTab } = context;

  if (activeTab !== id) {
    return null;
  }

  return <div className="tab-panel">{children}</div>;
};
```