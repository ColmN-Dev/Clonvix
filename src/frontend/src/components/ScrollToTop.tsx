import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { scrollToTop } from '../utils/scrollToTop'

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    scrollToTop();
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;