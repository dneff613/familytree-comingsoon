// One in-flight request per page; success is terminal and requires a pending request.
export function createSubmissionState(onChange, onSuccess) {
  let status = 'idle';
  return {
    begin() {
      if (status !== 'idle') return false;
      status = 'pending';
      onChange(status, 'Submitting your signup…');
      return true;
    },
    succeed() {
      if (status !== 'pending') return false;
      status = 'success';
      onChange(status, 'Thank you. Check your inbox to confirm your email.');
      onSuccess();
      return true;
    },
    fail(message) {
      if (status === 'success') return;
      status = 'idle';
      onChange(status, message);
    },
  };
}
