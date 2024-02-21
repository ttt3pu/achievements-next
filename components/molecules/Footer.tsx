export default function Footer() {
  return (
    <footer className="text-xs text-center p-8 mx-auto max-w-contents-with-p">
      <a href="https://github.com/ttt3pu/achievements-next">Source code</a>
      <div className="mb-2" />
      <small className="text-xs">
        &copy; {new Date().getFullYear()}, <a href="https://attt.hachiware.cat">attt</a> All rights reserved.
      </small>
    </footer>
  );
}
