function ConsentModal({ onAgree }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-lg font-semibold mb-4">Consent to Participate</h2>
        <p className="text-sm mb-4">
          This system will use your webcam to detect facial expressions in real time.
          All data is anonymous and for research purposes only.
        </p>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
          onClick={onAgree}
        >
          I Agree
        </button>
      </div>
    </div>
  );
}

export default ConsentModal;