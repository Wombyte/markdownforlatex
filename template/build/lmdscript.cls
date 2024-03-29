\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{build/lmdscript}[Uni Skript]

\LoadClass{build/lmdreport}

% coloneqq
\usepackage{mathtools}

% Langauge (necessary for \maketitle)
\usepackage[ngerman]{babel} 
\usepackage[T1]{fontenc}
\usepackage{lmodern}

% define font
\usepackage{pifont}
\usepackage{helvet}
\renewcommand{\familydefault}{\sfdefault}

% activates numberings for all headings over subsubsections
% default is 2 (subsection)
\setcounter{secnumdepth}{3} 

% changes the chapter style
\usepackage{titlesec}
\titleformat{\chapter}{\normalfont\Huge\bf}{\thechapter}{20pt}{}
\titlespacing*{\section}{0pt}{12ex plus 1ex minus 1ex}{1ex}
\titlespacing*{\subsection}{0pt}{10ex plus 1ex minus 1ex}{1ex}
\titlespacing*{\subsubsection}{0pt}{8ex plus 1ex minus 1ex}{1ex}
\titlespacing*{\paragraph}{0pt}{6ex}{1ex}

% defines the margin of all pages
\usepackage[paper=a4paper,left=20mm,right=20mm,top=20mm,bottom=20mm]{geometry}

% define math spacing
\AtBeginDocument{\setlength{\abovedisplayskip}{4pt}}
\AtBeginDocument{\setlength{\belowdisplayskip}{4pt}}
\AtBeginDocument{\setlength{\abovedisplayshortskip}{0pt}}
\AtBeginDocument{\setlength{\belowdisplayshortskip}{0pt}}

% refs
\usepackage[
    colorlinks,
    pdfpagelabels,
    pdfstartview = FitH,
    bookmarksopen = true,
    bookmarksnumbered = true,
    linkcolor = black,
    plainpages = false,
    hypertexnames = false,
    citecolor = black
]{hyperref}

% math commands
\newcommand{\R}{\mathbb{R}}
\newcommand{\N}{\mathbb{N}}
\renewcommand{\subset}{\subseteq}

\let\smallfrac\frac
\renewcommand{\frac}{\displaystyle\smallfrac}
\let\smallsum\sum
\renewcommand{\sum}{\displaystyle\smallsum}
\let\smallprod\prod
\renewcommand{\prod}{\displaystyle\smallprod}
\let\smallmin\min
\renewcommand{\min}{\displaystyle\smallmin}
\let\smallmax\max
\renewcommand{\max}{\displaystyle\smallmax}
\let\smallsup\sup
\renewcommand{\sup}{\displaystyle\smallsup}
\let\smallinf\inf
\renewcommand{\inf}{\displaystyle\smallinf}
\let\smallbigcup\bigcup
\renewcommand{\bigcup}{\displaystyle\smallbigcup}
\let\smallbigcap\bigcap
\renewcommand{\bigcap}{\displaystyle\smallbigcap}
\let\smallbigwedge\bigwedge
\renewcommand{\bigwedge}{\displaystyle\smallbigwedge}
\let\smallbigvee\bigvee
\renewcommand{\bigvee}{\displaystyle\smallbigvee}

% change lmdreport style
\definecolor{light-gray}{gray}{0.75}
\renewcommand{\explbullet}[1]{\textcolor{light-gray}{\textbf{\grqq}}}
\renewcommand{\explhead}[1]{\textcolor{light-gray}{\textit{#1}}}
\renewcommand{\explbody}[1]{\textcolor{light-gray}{\textit{#1}}}
\renewcommand{\smplbullet}[1]{\textcolor{light-gray}{\textbf{eg}}}
\renewcommand{\smplhead}[1]{\textcolor{light-gray}{\textit{#1}}}
\renewcommand{\smplbody}[1]{\textcolor{light-gray}{\textit{#1}}}