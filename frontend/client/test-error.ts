import { of, throwError } from 'rxjs';

let errorMessage = '';
let isLoading = true;

const obs = throwError(() => ({
  error: { message: undefined },
  message: 'Http failure response for http://localhost:5000: 0 Unknown Error'
}));

obs.subscribe({
  next: () => { isLoading = false; },
  error: (err) => {
    errorMessage = err.error?.message || 'Failed to load questions. Please try again.';
    isLoading = false;
  }
});

console.log({ errorMessage, isLoading });
