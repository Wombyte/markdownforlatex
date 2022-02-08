\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{.lmd/mwdreport}[MWarkDown basis]

\LoadClass[10pt,fleqn,titlepage]{report}

% define image-folder
\usepackage{graphicx}
\graphicspath{ {./images/} }

% defining the eg symbol
\newcommand{\egsymbol}{
	\begingroup
	\normalfont\includegraphics[height=\fontcharht\font`\M]{egsymbol.png}%
	\endgroup
}

% mathmatical symbols
% eg black triangle for definitions
\RequirePackage{amsmath,amssymb}

% controll flow
\RequirePackage{ifthen}

% list environment
\RequirePackage{enumitem}
\newlist{mwdlist}{enumerate}{3}
\setlist[mwdlist,1]{
	label={\bf\arabic*.},
	leftmargin=30pt,
	topsep=2pt,
	itemsep=3pt,
	parsep=0pt
}
\setlist[mwdlist,2]{
	label={\bf\roman*)},
	leftmargin=30pt,
	topsep=2pt,
	itemsep=3pt,
	parsep=0pt,
	before*=\small
}
\setlist[mwdlist,3]{
	label={\bf\alph*)},
	leftmargin=30pt,
	topsep=2pt,
	itemsep=3pt,
	parsep=0pt,
	before*=\footnotesize
}

\newcommand{\num}[2][]{
	\item 
	\ifthenelse { \equal {#1} {} }
	{ }
	{ {\bf #1:}}
	{#2}
}

\newcommand{\defineNoteCommand}[4]{
	\newcommand{#1}[2][]{
		\item[#2] 
		\ifthenelse { \equal {##1} {} }
		{ }
		{ {#3 ##1:}}
		{#4##2}
	}
}

\defineNoteCommand{\note}{$\bullet$}{\bf}{} % ,
\defineNoteCommand{\plus}{\textbf{+}}{\bf}{} % +
\defineNoteCommand{\minus}{\textbf{-}}{\bf}{} % -
\defineNoteCommand{\nota}{\ding{46}}{\bf}{} % !
\defineNoteCommand{\theo}{$\circledast$}{\bf}{} % *
\defineNoteCommand{\conc}{$\Rightarrow$}{\bf}{} % =>

\defineNoteCommand{\expl}{\glqq\grqq}{\it}{\it} % "
\defineNoteCommand{\smpl}{$\egsymbol$}{\it}{\it} % eg

\newcommand{\defi}[3][]{ % >
	\item[$\blacktriangleright$] #1 \textbf{#2} #3
}

\newcommand{\blanknote}[1]{\item[ ]#1}

% images
\RequirePackage{color} % nec. for pic
\newcommand{\picname}[1]{#1.png}
\newcommand{\pic}[2]{
	\IfFileExists{./images/\picname{#1}}{
		\begin{minipage}{#2\textwidth}
			\includegraphics[width=\textwidth]{\picname{#1}}
		\end{minipage}
	}{\textcolor{red}{\picname{#1}}}
}